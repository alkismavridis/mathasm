package eu.alkismavridis.mathasm;


import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import org.neo4j.ogm.session.SessionFactory;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.DependsOn;
import org.springframework.data.neo4j.transaction.Neo4jTransactionManager;
import org.springframework.util.ResourceUtils;

import java.io.FileNotFoundException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Configuration
//@EnableNeo4jRepositories(basePackages = "eu.alkismavridis.mathasm")
@EntityScan("eu.alkismavridis.mathasm.db.entities")
public class MathAsmConfigurationHolder {
    @Bean
    @DependsOn("mathAsmConfig")
    public org.neo4j.ogm.config.Configuration getConfiguration(ApplicationContext appContext) throws Exception {
        final MathAsmConfig config = (MathAsmConfig)appContext.getBean("mathAsmConfig");
        if (config==null) throw new Exception("Neo4jConfiguration: could not load MathAsmConfig.");


        System.out.println(config.getDBDir().toUri().toString());

        return new org.neo4j.ogm.config.Configuration.Builder()
                .uri(config.getDBDir().toUri().toString())
                .build();
    }

    @Bean
    public SessionFactory sessionFactory(ApplicationContext appContext) throws Exception {
        return new SessionFactory(getConfiguration(appContext), "eu.alkismavridis.mathasm.db.entities");
    }

    @Bean
    public Neo4jTransactionManager transactionManager(ApplicationContext appContext) throws Exception {
        return new Neo4jTransactionManager(sessionFactory(appContext));
    }


    /**
     * Fields value may be overridden by a configuration json file.
     * The configuration file may be provided with the following JVM option:
     *
     * -DmathAsmDataDir="/path/to/my/file.json"
     * when the application starts, the file wil be scanned, and every option that matches one of the
     * configuration field's names will be loaded.
     * The configuration fields that will be not mentioned in the given json file will keep their default values.
     *
     * */
    @Bean
    MathAsmConfig mathAsmConfig() {
        try {
            //1. Check if a json configuration file is provided.
            final String pathToConfFile = System.getProperty("mathAsmDataDir");
            if(pathToConfFile==null) throw new Exception(
                "\n\n\nMathASM needs a directory in your file system in order to work!\n"+
                "Please define it using -DmathAsmDataDir=\"/path/to/my/dir\" in your java command.\n"+
                "Don't worry if the directory does not exists, MathAsm will create it.\n"+
                "You just have to define where this will be.\n\n\n"
            );



            final Path dataDir = Paths.get(pathToConfFile).toAbsolutePath().normalize();

            //2. If it is provided, assert its existence
            if (!Files.exists(dataDir)) {
                System.out.println("Data directory "+dataDir.toString()+" does not extist. Attempt to create it.");

                Files.createDirectories(dataDir);
                System.out.println("Data directory "+dataDir.toString()+" successfully created.");
            }

            //3. Parse its configuration json
            final Path configFile = dataDir.resolve("config.json");

            JsonNode json;
            final ObjectMapper mapper = new ObjectMapper();
            if(Files.exists(configFile)) {
                json = mapper.readTree(Files.newInputStream(configFile));
                if(json!=null) {
                    System.out.println("\n\n\nMathAsmApplication: configuration was loaded:\n");
                    System.out.println(mapper.writerWithDefaultPrettyPrinter().writeValueAsString(json));
                    System.out.println("\n\n\n");
                }
                else throw new Exception(
                        "MathAsmApplication: file  "+configFile.toString()+
                        " does not contain a valid json. Please check the contents of this file."
                );
            }
            else {
                System.out.println("No config.json was found in data directory. Default values will be used.");
                json = JsonNodeFactory.instance.objectNode();
            }

            //4. Create the configuration object
            return new MathAsmConfig(dataDir, json);
        }
        catch (Exception ex) {
            ex.printStackTrace();
            System.out.println("MathAsmApplication: error detected while loading not load configuration. Application cannot start. Abort.");
            System.exit(1);
            return null;
        }
    }
}

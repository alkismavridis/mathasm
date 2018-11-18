package eu.alkismavridis.mathasm.api;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import eu.alkismavridis.mathasm.core.error.MathAsmException;
import eu.alkismavridis.mathasm.api.utils.GraphqlContext;
import eu.alkismavridis.mathasm.services.App;
import org.neo4j.ogm.model.Result;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/ql")
public class GraphqlController {

    //region DEPENDENCIES
    @Autowired
    App app;

    @Autowired
    SessionFactory sessionFactory;

    @Autowired
    private GraphqlService graphqlService;
    //endregion





    //region UTIL FUNCTIONS
    private Map<String, Object> requestToMap(String requestStr) throws Exception {
        return new ObjectMapper().readValue(
            requestStr,
            new TypeReference<Map<String, Object>>(){}
        );
    }

    private GraphqlContext makeContext() {
        return new GraphqlContext(null);
    }

    private static ResponseEntity sendJson(String message, int status) {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.put("message", message);
        return ResponseEntity.status(status).body(node);
    }

    private static ResponseEntity sendJson(Throwable thr, int status) {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.put("message", thr.getMessage()==null? thr.getClass().getSimpleName() : thr.getMessage());
        if (thr instanceof MathAsmException) {
            node.put("error", ((MathAsmException) thr).getCode().getValue());
        }

        return ResponseEntity.status(status).body(node);
    }
    //endregion




    //region GRAPH-QL FUNCTIONS
    @RequestMapping(value="", method=RequestMethod.POST)
    public ResponseEntity simpleQuery(@RequestBody String query) {
        final String result =  graphqlService.execute(query, null, null, this.makeContext());
        return ResponseEntity.ok(result);
    }

    @RequestMapping(value="/params", method=RequestMethod.POST)
    public ResponseEntity queryWithParams(@RequestBody String requestStr) {
        //1. Decode the request
        Map<String, Object> request = null;
        try { request = this.requestToMap(requestStr); }
        catch (Exception ex) {
            return GraphqlController.sendJson(ex, 400);
        }


        //2. Create the context
        final GraphqlContext ctx = this.makeContext();
        final String result =  graphqlService.execute((String)request.get("q"), (Map<String,Object>)request.get("p"), (String)request.get("n"), ctx);
        return ResponseEntity.ok(result);
    }
    //endregion




    //region DUMMY - TO BE DELETED
    @RequestMapping(value="/runCypher", method=RequestMethod.POST)
    public ResponseEntity sentences(@RequestBody String query) {
        Session ses = sessionFactory.openSession();
//        ses.beginTransaction();
        Result res = ses.query(query, Collections.emptyMap());
        try {
            return ResponseEntity.ok(new ObjectMapper().writerWithDefaultPrettyPrinter().writeValueAsString(res));
        } catch (JsonProcessingException e) {
            e.printStackTrace();
            return GraphqlController.sendJson(e, 500);
        }
    }

        //endregion
}

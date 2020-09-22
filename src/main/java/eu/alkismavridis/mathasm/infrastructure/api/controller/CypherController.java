package eu.alkismavridis.mathasm.infrastructure.api.controller;


import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.*;
import eu.alkismavridis.mathasm.entities.error.MathAsmException;
import eu.alkismavridis.mathasm.infrastructure.db.entities.*;
import eu.alkismavridis.mathasm.infrastructure.services.App;
import org.neo4j.ogm.model.Edge;
import org.neo4j.ogm.model.Result;
import org.neo4j.ogm.session.Session;
import org.neo4j.ogm.session.SessionFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletRequest;
import java.util.*;

@RestController
@RequestMapping("/cypher")
public class CypherController {

    enum GraphNodeType {
        USER(1),
        THEORY(2),
        SYMBOL(3),
        OBJECT(4),
        STATEMENT(5),
        MOVE(6),
        PROOF(7),

        //primitive types
        PRIMITIVE(8);

        private int value;
        GraphNodeType(int v) { this.value = v; }
        public int getValue() { return value; }
    }


    //region DEPENDENCIES
    @Autowired
    App app;

    @Autowired
    SessionFactory sessionFactory;

    @Autowired
    private GraphqlService graphqlService;

    @Autowired
    private HttpServletRequest request;
    //endregion





    //region UTIL FUNCTIONS
    private static ResponseEntity sendJson(Throwable thr, int status) {
        ObjectNode node = JsonNodeFactory.instance.objectNode();
        node.put("message", thr.getMessage()==null? thr.getClass().getSimpleName() : thr.getMessage());
        if (thr instanceof MathAsmException) {
            node.put("error", ((MathAsmException) thr).getCode().getValue());
        }

        return ResponseEntity.status(status).body(node);
    }




    /**
     * Converts the given neo4j Result to a graph-like JsonObject
     * in the form of:
     * {
     *     "data": {
     *         "nodes": [],
     *         "edges": [],
     *         "areAllEntitiesHandled": boolean
     *     }
     * }
     * */
    JsonNode toGraphResponse(final Result dbResult) throws Exception {
        //1. Calculate all nodes and edges
        boolean areAllEntitiesHandled = true;

        final Map<Long, JsonNode> nodes = new HashMap<>();
        final Map<Long, JsonNode> edges = new HashMap<>();
        for (Map<String, Object> row : dbResult.queryResults()) {
            areAllEntitiesHandled &= addResultToJson(row, nodes, edges);
        }

        //2. Setup response
        final ObjectNode data = JsonNodeFactory.instance.objectNode();
        data.set("nodes", new ArrayNode(JsonNodeFactory.instance, new ArrayList<>(nodes.values())));
        data.set("edges", new ArrayNode(JsonNodeFactory.instance, new ArrayList<>(edges.values())));
        data.put("areAllEntitiesHandled", areAllEntitiesHandled);

        final ObjectNode ret = JsonNodeFactory.instance.objectNode();
        ret.set("data", data);

        return ret;
    }

    void addNode(Map<Long, JsonNode> targetMap, Long id, String label, GraphNodeType type, JsonNode data) {
        targetMap.put(
            id,
            JsonNodeFactory.instance.objectNode()
                .put("id", id)
                .put("label", label)
                .put("_t", type.getValue())
                .set("_data", data)
        );
    }

    boolean addResultToJson(Map<String, Object> row, Map<Long, JsonNode> nodes, Map<Long, JsonNode> edges) {
        boolean areAllEntitiesHandled = true;

        for(Object val : row.values()) {
            if (val==null) continue;
            if (val instanceof User) addNode(nodes, ((User) val).getId(), ((User) val).getUserName(), GraphNodeType.USER, ((User) val).toNodeJson());
            else if (val instanceof MathAsmTheory) addNode(nodes, ((MathAsmTheory) val).getId(), ((MathAsmTheory) val).getName(), GraphNodeType.THEORY, ((MathAsmTheory) val).toNodeJson());
            else if (val instanceof MathAsmSymbol) addNode(nodes, ((MathAsmSymbol) val).getId(), ((MathAsmSymbol) val).getText(), GraphNodeType.SYMBOL, ((MathAsmSymbol) val).toNodeJson());
            else if (val instanceof MathAsmStatementEntity) addNode(nodes, ((MathAsmStatementEntity) val).getId(), ((MathAsmStatementEntity) val).getName(), GraphNodeType.STATEMENT, ((MathAsmStatementEntity) val).toNodeJson());
            else if (val instanceof MathAsmProof) addNode(nodes, ((MathAsmProof) val).getId(), "Proof", GraphNodeType.PROOF, ((MathAsmProof) val).toNodeJson());
            else if (val instanceof MathAsmDirEntity) addNode(nodes, ((MathAsmDirEntity) val).getId(), ((MathAsmDirEntity) val).getName(), GraphNodeType.OBJECT, ((MathAsmDirEntity) val).toNodeJson());
            else if (val instanceof LogicMoveEntity) addNode(nodes, ((LogicMoveEntity) val).getId(), "move", GraphNodeType.MOVE, ((LogicMoveEntity) val).toNodeJson());
            else if (val instanceof String) addNode(nodes, (long)val.hashCode(), (String)val, GraphNodeType.PRIMITIVE, new TextNode((String)val));
            else if (val instanceof Number) {
                final String asString = val.toString();
                addNode(nodes, (long)val.hashCode(), asString, GraphNodeType.PRIMITIVE, new TextNode(asString));
            }
            else if (val instanceof Boolean) addNode(nodes, (long)val.hashCode(), val.toString(), GraphNodeType.PRIMITIVE, new TextNode(val.toString()));
            else if (val instanceof Collection) {
                final JsonNode node = new ObjectMapper().convertValue(val, new TypeReference<List>(){});
                addNode(nodes, (long)val.hashCode(), val.hashCode()+"", GraphNodeType.PRIMITIVE, node);
            }
            else if (val.getClass().isArray()) {
                final Object[] array = (Object[])val;
                final JsonNode node = new ObjectMapper().valueToTree(array);
                addNode(nodes, (long)val.hashCode(), val.hashCode()+"", GraphNodeType.PRIMITIVE, node);
            }

            else if (val instanceof Edge) {
                final Long id = ((Edge) val).getId();
                edges.put(
                    id,
                    JsonNodeFactory.instance.objectNode()
                        .put("id", id)
                        .put("from", ((Edge) val).getStartNode())
                        .put("to", ((Edge) val).getEndNode())
                        .put("label", ((Edge) val).getType())
                        .put("arrows", "to")
                );
            }

            else {
                areAllEntitiesHandled = false;
                System.err.print("Cypher serialization: Unknown class: "+val.getClass().getName());
            }
        }

        return areAllEntitiesHandled;
    }
    //endregion



    //region DUMMY - TO BE DELETED
    @RequestMapping(value="", method=RequestMethod.POST)
    public ResponseEntity sentences(@RequestBody String query) {
        Session ses = sessionFactory.openSession();
//        ses.beginTransaction();
        Result res = ses.query(query, Collections.emptyMap());
        try {

            return ResponseEntity.ok(toGraphResponse(res));
        } catch (Exception e) {
            e.printStackTrace();
            return CypherController.sendJson(e, 500);
        }
    }

        //endregion
}

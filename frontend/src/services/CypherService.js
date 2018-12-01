export default class CypherService {

    static maktoGraph(dbData) {
        //1. Handle null case
        if(!dbData) return {nodes:[],relationships:[]};

        //2. for every result, add the nodes and relationships
        const nodeMap = {};
        const edgeMap = {};
        for (let result of dbData) {
            for (let key in result) {
                //2a. get the entity
                if (!result.hasOwnProperty(key)) continue;
                const entity = result[key];
                if (entity==null) continue;

                //2b. integrate it into the result
                if (entity.hasOwnProperty("startNode")) {
                    //we have a relationship
                    edgeMap[entity.id] = {from:entity.startNode, to:entity.endNode};
                }
                else {
                    //we have a node
                    nodeMap[entity.id] = entity;
                }
            }
        }

        return {
            nodes:Object.values(nodeMap),
            relationships:Object.values(edgeMap)
        };
    }
}
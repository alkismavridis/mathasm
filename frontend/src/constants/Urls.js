const FRONTEND_BASE = "/";
const BACKEND_BASE = "http://localhost:8080/";

export default {

  pages:{
      graphiql: FRONTEND_BASE+"graphiql",
      theory: FRONTEND_BASE+"theory",
      main: FRONTEND_BASE+"main",
      dbVisualisation: FRONTEND_BASE+"vis",
      about: FRONTEND_BASE+"about"
  },

  graphql: {
      simple: BACKEND_BASE+"ql",
      params: BACKEND_BASE+"ql/params",
  },

    cypher: {
      raw: BACKEND_BASE+"cypher"
    }
};
const HTML_BASE = "/pages/";
const BACKEND_BASE = "http://localhost:8080/";

export default {
  pages:{
      graphiql: HTML_BASE+"graphiql",
      main: HTML_BASE+"main",
      dbVisualisation: HTML_BASE+"vis",
      about: HTML_BASE+"about"
  },

  graphql: {
      simple: BACKEND_BASE+"ql",
      params: BACKEND_BASE+"ql/params",
  },

    cypher: {
      raw: BACKEND_BASE+"cypher"
    }
};
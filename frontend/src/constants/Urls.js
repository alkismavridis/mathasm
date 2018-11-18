const FRONTEND_BASE = "/";
const BACKEND_BASE = "http://localhost:8080/";

export default {

  pages:{
      graphiql: FRONTEND_BASE+"graphiql",
      login: FRONTEND_BASE+"login",
      theory: FRONTEND_BASE+"theory"
  },

  graphql: {
      simple: BACKEND_BASE+"ql",
      params: BACKEND_BASE+"ql/params",
  }
};
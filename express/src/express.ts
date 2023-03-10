import { AppIns } from "type";
import App from "./application";

function createApplication() {
  const app = new App() as AppIns;

  return app;
}

export default createApplication;

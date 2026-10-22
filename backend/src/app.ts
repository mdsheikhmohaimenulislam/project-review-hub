import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import config from "./config/index.ts";
import { AuthRoutes } from "./module/auth/auth.route.ts";
import { globalErrorHandling } from "./middlewares/error.middleware.ts";
import { notFound } from "./middlewares/notFound.ts";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


app.get("/", (req: Request, res: Response) => {
  res.send("Hello, World!");
});


app.use("/auth", AuthRoutes);




app.use(notFound);
app.use(globalErrorHandling);

export default app;

import express from "express";
import type { Request, Response, NextFunction } from "express";
import cors from "cors";
import apiRoutes from "./routes/api.routes";

const app = express();
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.static("public"));

// Route configuration

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'Bienvenido a la API' });
});

app.use("/api", apiRoutes);

// 404 handler
app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({
    message: "Not found",
  });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message });
});

export default app;

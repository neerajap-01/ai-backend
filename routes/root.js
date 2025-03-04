import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
  res.status(200).send({
    statusCode: 200,
    error: 0,
    message: "Hello, World!",
    data: null
  });
});

export default router;
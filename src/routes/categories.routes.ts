import { Router } from 'express';
import { getRepository } from 'typeorm';
import Category from '../models/Category';

const categoriesRoutes = Router();

categoriesRoutes.post('/', async (request, response) => {
  try {
    const { title } = request.body;
    const categoryRespository = getRepository(Category);
    const category = categoryRespository.create({ title });
    await categoryRespository.save(category);
    return response.json(category);
  } catch (err) {
    return response.status(400).json({ error: err.message });
  }
});

export default categoriesRoutes;

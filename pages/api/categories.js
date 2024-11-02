import { Category } from "@/models/Category";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";
import mongoose from 'mongoose'; // Import mongoose

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  try {
    if (method === 'GET') {
      const categories = await Category.find(); // Removed .populate('parent')
      return res.json(categories);
    }

    if (method === 'POST') {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: 'Name is required' });
      
      const categoryDoc = await Category.create({ name });
      return res.json(categoryDoc);
    }

    if (method === 'PUT') {
      const { name, _id } = req.body;
      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({ message: 'Invalid ID' });

      const categoryDoc = await Category.findByIdAndUpdate(_id, { name }, { new: true });
      if (!categoryDoc) return res.status(404).json({ message: 'Category not found' });
      
      return res.json(categoryDoc);
    }

    if (method === 'DELETE') {
      const { _id } = req.query;
      if (!_id || !mongoose.Types.ObjectId.isValid(_id)) return res.status(400).json({ message: 'Invalid ID' });

      const result = await Category.deleteOne({ _id });
      if (result.deletedCount === 0) return res.status(404).json({ message: 'Category not found' });
      
      return res.json({ message: 'Category deleted successfully' });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${method} Not Allowed`);
  } catch (error) {
    console.error('Error handling request:', error);
    res.status(500).json({ message: 'Server error' });
  }
}

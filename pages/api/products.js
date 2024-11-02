import { Product } from "@/models/Product";
import { mongooseConnect } from "@/lib/mongoose";
import { isAdminRequest } from "@/pages/api/auth/[...nextauth]";

export default async function handle(req, res) {
  const { method } = req;
  await mongooseConnect();
  await isAdminRequest(req, res);

  if (method === "GET") {
    if (req.query?.id) {
      res.json(await Product.findOne({ _id: req.query.id }));
    } else {
      res.json(await Product.find());
    }
  }

  if (method === "POST") {
    const {
      title,
      description,
      price,
      discounted_percentage,
      images,
      category,
      properties,
      featured,
    } = req.body;
    const productDoc = await Product.create({
      title,
      description,
      price,
      discounted_percentage,
      images,
      category,
      properties,
      featured,
    });
    res.json(productDoc);
  }

  if (method === "PUT") {
    const { _id, featured } = req.body;

    // Update only the `featured` field to avoid overwriting other fields
    await Product.updateOne({ _id }, { $set: { featured } });
    res.json({ success: true });
  }

  if (method === "DELETE") {
    if (req.query?.id) {
      await Product.deleteOne({ _id: req.query?.id });
      res.json(true);
    }
  }
}

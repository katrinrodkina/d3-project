import connectDB from '../../../../middleware/database';
import Dashboard from '../../../../middleware/models/dashboard';

const handler = async (req, res) => {
  if (req.method === 'GET') {
    const { id } = req.query;
    Dashboard.findById(id, (err, model) => {
      if (err) console.log(err);
      return res.status(200).json({ config: model });
    });
  } else {
    return res.status(422).send('req_method_not_supported');
  }
};

export default connectDB(handler);

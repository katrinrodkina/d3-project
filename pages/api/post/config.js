import connectDB from '../../../middleware/database';
import Dashboard from '../../../middleware/models/dashboard';

const handler = async (req, res) => {
  if (req.method === 'POST') {
    const graphs = Object.values(req.body.graph.allGraphs).map((el) => {
      return {
        id: el.id,
        fileName: el.fileName || '',
        data: el.data,
        config: req.body.graph.configs[el.id],
      };
    });

    Dashboard.create({ graphs }, (err, model) => {
      if (err) console.log(err);
      return res.status(200).json({ id: model._id });
    });
  } else {
    return res.status(422).send('req_method_not_supported');
  }
};

export default connectDB(handler);

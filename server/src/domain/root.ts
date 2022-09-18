import * as express from 'express';

export function initRoutes(app: express.Application): void {
  app.get('/api', async (req, res) => {
    res.send({'status': 'available'});
  });
}

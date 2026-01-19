const dashboardService = require('../services/dashboardService');

async function getSummary(req, res) {
  try {
    // 🔒 Somente TI
    if (req.user.sector_id !== 29) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const data = await dashboardService.getDashboardSummary();
    res.json(data);

  } catch (error) {
    console.error('Erro dashboard controller:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getRoomsStatusChart(req, res) {
  try {
    if (req.user.sector_id !== 29) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const data = await dashboardService.getRoomsByStatus();
    res.json(data);

  } catch (error) {
    console.error('Erro gráfico status:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}
async function getRoomsBySector(req, res) {
  try {
    if (req.user.sector_id !== 29) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const data = await dashboardService.getRoomsBySector();
    res.json(data);

  } catch (error) {
    console.error('Erro gráfico setores:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
}

async function getMessagesOverTime(req, res) {
  try {
    if (req.user.sector_id !== 29) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const group = req.query.group || 'day';
    const data = await dashboardService.getMessagesOverTime(group);
    res.json(data);

  } catch (error) {
    console.error('Erro gráfico mensagens:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}
async function getTopCreators(req, res) {
  try {
    if (req.user.sector_id !== 29) {
      return res.status(403).json({ error: 'Acesso negado' });
    }

    const data = await dashboardService.getTopCreators();
    res.json(data);

  } catch (error) {
    console.error('Erro ranking criadores:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
}

module.exports = {
  getSummary,
  getRoomsStatusChart,
  getRoomsBySector,
  getMessagesOverTime,
  getTopCreators
};

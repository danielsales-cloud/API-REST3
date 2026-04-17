const express = require('express');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

const app = express();
app.use(express.json());

let db;

async function setupDb() {
    db = await open({
        filename: './database.db',
        driver: sqlite3.Database
    });

    await db.exec(`
        CREATE TABLE IF NOT EXISTS filmes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT,
            nota REAL,
            categoria TEXT
        )
    `);

    const count = await db.get('SELECT COUNT(*) as total FROM filmes');
    
    if (count.total === 0) {
        const iniciais = [
            ["Matrix", 9, "Ficção Científica"], 
            ["Titanic", 8, "Romance"],
            ["Batman", 10, "Ação"], 
            ["Inception", 9, "Ficção Científica"],
            ["O Senhor dos Anéis", 10, "Fantasia"], 
            ["Clube da Luta", 8.8, "Drama"],
            ["Pulp Fiction", 8.9, "Crime"], 
            ["Forrest Gump", 8.8, "Drama"],
            ["Interstellar", 8.6, "Ficção Científica"], 
            ["Gladiador", 8.5, "Ação"]
        ];
        for (const f of iniciais) {
            await db.run('INSERT INTO filmes (nome, nota, categoria) VALUES (?, ?, ?)', f);
        }
        console.log("✅ Banco iniciado com 10 filmes base.");
    }
}

setupDb();

app.get('/api/filmes', async (req, res) => {
    try {
        const { categoria, ordem = 'ASC', limite = 10, pagina = 1 } = req.query;
        
        const limiteNum = parseInt(limite);
        const paginaNum = parseInt(pagina);
        const offset = (paginaNum - 1) * limiteNum;

        let filtroSql = ' FROM filmes WHERE 1=1';
        const params = [];

        if (categoria) {
            filtroSql += ' AND categoria = ?';
            params.push(categoria);
        }

        const { total } = await db.get(`SELECT COUNT(*) as total ${filtroSql}`, params);

        let sqlFinal = `SELECT * ${filtroSql} ORDER BY nome ${ordem.toUpperCase()} LIMIT ? OFFSET ?`;
        const filmes = await db.all(sqlFinal, [...params, limiteNum, offset]);

        res.json({
            dados: filmes,
            paginacao: {
                pagina_atual: paginaNum,
                itens_por_pagina: limiteNum,
                total_itens: total,
                total_paginas: Math.ceil(total / limiteNum)
            }
        });
    } catch (error) {
        res.status(500).json({ erro: 'Erro interno no servidor' });
    }
});

app.get('/api/filmes/:id', async (req, res) => {
    try {
        const filme = await db.get('SELECT * FROM filmes WHERE id = ?', [req.params.id]);
        if (!filme) return res.status(404).json({ erro: "Não encontrado" });
        res.json(filme);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar filme" });
    }
});

app.post('/api/filmes', async (req, res) => {
    try {
        const { nome, nota, categoria } = req.body;

        if (!nome || nota === undefined || !categoria) {
            return res.status(400).json({ erro: "Campos obrigatórios: nome, nota, categoria" });
        }
        if (typeof nota !== 'number' || nota < 0 || nota > 10) {
            return res.status(400).json({ erro: "Nota deve ser um número entre 0 e 10" });
        }
        if (nome.length < 2) {
            return res.status(400).json({ erro: "Nome muito curto" });
        }

        const result = await db.run(
            'INSERT INTO filmes (nome, nota, categoria) VALUES (?, ?, ?)',
            [nome, nota, categoria]
        );

        res.status(201).json({ id: result.lastID, nome, nota, categoria });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao inserir filme" });
    }
});

app.put('/api/filmes/:id', async (req, res) => {
    try {
        const { nome, nota, categoria } = req.body;
        
        const result = await db.run(
            'UPDATE filmes SET nome = ?, nota = ?, categoria = ? WHERE id = ?',
            [nome, nota, categoria, req.params.id]
        );

        if (result.changes === 0) return res.status(404).json({ erro: "Não encontrado" });
        res.json({ id: req.params.id, nome, nota, categoria });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar filme" });
    }
});

app.delete('/api/filmes/:id', async (req, res) => {
    try {
        const result = await db.run('DELETE FROM filmes WHERE id = ?', [req.params.id]);
        if (result.changes === 0) return res.status(404).json({ erro: "Não encontrado" });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar filme" });
    }
});

app.listen(3000, () => console.log('🚀 Servidor pronto em http://localhost:3000'));
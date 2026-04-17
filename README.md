## API de Catálogo de Filmes

**Aluno:** Daniel de Sales Bernardino  
**Matrícula:** 251041089  

---

## Endpoints

* **GET /api/filmes** → lista todos os filmes cadastrados
* **GET /api/filmes/:id** → busca filme por ID
* **POST /api/filmes** → cria novo filme
* **PUT /api/filmes/:id** → atualiza um filme existente
* **DELETE /api/filmes/:id** → remove um filme por ID

---

## Exemplos de filmes no sistema

* Matrix (Ficção Científica, 9)
* Titanic (Romance, 8)
* Batman (Ação, 10)
* Inception (Ficção Científica, 9)
* O Senhor dos Anéis (Fantasia, 10)
* Gladiador (Ação, 8.5)

---

## Testes realizados

* **GET todos:** retorno da lista completa de filmes com paginação e filtros
* **GET por ID:** busca funcional através do identificador único no banco de dados
* **POST sucesso:** criação de novos registros com persistência em SQLite
* **PUT:** atualização de dados de registros existentes
* **DELETE:** remoção de filmes e verificação de persistência no banco de dados

---

**Nota:** O projeto utiliza SQLite para armazenamento e Nodemon para gerenciamento do servidor.

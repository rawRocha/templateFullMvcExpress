//Carrega as variáveis de ambiente do arquivo .env
require('dotenv').config()

//Importa o framework Express
const express = require('express')
const app = express() //Cria uma instância do Express
const mongoose = require('mongoose') //Importa o mongoose para trabalhar com o MongoDB

//Conecta ao MongoDB usando a CONNECTIONSTRING definida no arquivo .env
mongoose.connect(process.env.CONNECTIONSTRING)
    .then(() => {
        console.log('Conectei a base de dados.')
        app.emit('pronto') // Emite o evento 'pronto' quando a conexão for estabelecida
    })
    .catch(e => console.log(e)) //Captura e imprime erros de conexão

// Importa os módulos necessários para sessões, armazenamento no MongoDB e flash messages
const session = require('express-session')
const MongoStore = require('connect-mongo') // Cria uma nova instância de MongoStore para armazenar sessões no MongoDB
const flash = require('connect-flash') // Importa o módulo para mensagens flash

// Importa as rotas, o módulo 'path' para manipulação de caminhos e um middleware personalizado 
const routes = require('./routes')
const path = require('path')
const helmet = require('helmet')
const csrf = require('csurf')
const { middlewareGlobal, checkCsrfError, csrfMiddleware } = require('./src/middlewares/meuMiddleware')

// Configuração do Express para usar URL encoded e arquivos estáticos na pasta 'public'
app.use(helmet())

app.use(express.urlencoded({ extended: true }))
app.use(express.json())
app.use(express.static(path.resolve(__dirname, 'public')))

// Opções de configuração para sessão
const sessionOptions = session({
    secret: 'sdf4235kjhdf356456jkhlksdjf)!@#_$@',
    store: MongoStore.create({ mongoUrl: process.env.CONNECTIONSTRING }),
    resave: false,
    saveUninitialized: false,
    cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
})
app.use(sessionOptions) // Aplica as opções de sessão configuradas
app.use(flash()) // Middleware para mensagens flash

// Configura o diretório das views e o mecanismo de template EJS
app.set('views', path.resolve(__dirname, 'src', 'views'))
app.set('view engine', 'ejs')

app.use(csrf())
// Aplica um middleware personalizado
app.use(middlewareGlobal)
app.use(csrfMiddleware)
app.use(checkCsrfError)

// Aplica as rotas definidas no arquivo './routes
app.use(routes)

// Quando o evento 'pronto' for emitido, inicia o servidor na porta 3000
app.on('pronto', () => {
    app.listen(3000, () => {
        console.log('Servidor executando na porta 3000')
        console.log('http://localhost:3000/')
    })
})



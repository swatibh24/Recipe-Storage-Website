const express = require('express');
const cookieParser = require('cookie-parser');
const {v4: uuidv4 } = require('uuid');
const app = express();
const PORT = 3000;
const utils = require('./utils');
app.use(cookieParser());
app.use(express.static('./public'));
const counter = () => {
    let count = 0;
    return () => {
        count += 1;
        return count;
    };
};
nextID = counter();
app.get('/recipe', (req, res) => {
    res.send(utils.recipeList);
});

app.post('/session', express.json(), (req, res) => {
    const username = req.body.username;
    if ((typeof username === 'undefined') || (username === "") || (username.includes(' '))) {
        res.status(404).json({
            error: 'Not Found: missing-name'
        });
        return;
    }
    if ((username === 'DOG')) {
        res.status(403).json({
            error: "Forbidden: Invalid UserName"
        });
        return;
    }
    const uid = uuidv4();
    utils.user[uid] = username;
    const user = utils.user[uid];
    utils.user[uid] = {
        username
    };
    res.cookie('uid', uid);
    res.json(user);
});

app.get('/session', (req, res) => {
    const uid = req.cookies.uid;
    if (!uid || !utils.user[uid]) {
        res.status(401).json({
            error: 'Unauthorized User'
        });
        return;
    }
    if (!utils.user[uid]) {
        res.clearCookie('uid');
        res.status(403).json({
            error: 'User does not exist'
        });
        return;
    }
    res.sendStatus(200);
});


app.delete('/session', (req, res) => {
    const uid = req.cookies.uid;
    if (!uid || !utils.user[uid]) {
        res.status(401).json({
            error: 'Unauthorized User'
        });
        return;
    }
    if (!utils.user[uid]) {
        res.clearCookie('uid');
        res.status(403).json({
            error: 'User does not exist'
        });
        return;
    }
    delete utils.user[uid];
    res.status(200).json({
        message: 'Logout success!'
    });
});

app.get('/recipe/:id', (req, res) => {
    const id = req.params.id;

    if (!utils.recipeList[id]) {
        res.status(403).json({
            error: 'Recipe does not exist'
        });
        return;
    }
    author = utils.recipeList[id].author;
    title = utils.recipeList[id].title;
    ingredients = utils.recipeList[id].ingredients;
    instruction = utils.recipeList[id].instruction;
    res.json({
        'author': author,
        'title': title,
        'ingredients': ingredients,
        'instruction': instruction
    });
});

app.post('/recipe', express.json(), (req, res) => {
    const uid = req.cookies.uid;
    const title = req.body.title;
    const ingredients = req.body.ingredients;
    const instruction = req.body.instruction;
    author = utils.user[uid].username;
    if (!uid || !utils.user[uid]) {
        res.status(401).json({
            error: 'Unauthorized User'
        });
        return;
    }
    if (!utils.user[uid]) {
        res.clearCookie('uid');
        res.status(403).json({
            error: 'User does not exist'
        });
        return;
    }
    if (title.match(/^ *$/) || ingredients.match(/^ *$/) || instruction.match(/^ *$/)) {
        res.status(400).json({
            error: "Empty recipe: Please enter recipe details"
        });
        return
    }
    const id = nextID();
    utils.recipeList[id] = {
        "title": title,
        'author': author,
        'ingredients': ingredients,
        'instruction': instruction
    };
    res.json({
        'id': id,
        'result': 'Recipe Saved Sucessfully'
    });
});

app.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`));
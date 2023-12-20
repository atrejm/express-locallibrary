// getting-started.js
const mongoose = require('mongoose');
const uri = 'mongodb+srv://admin:Atma4930@cluster0.esoofzu.mongodb.net/library?retryWrites=true&w=majority';

main().catch(err => console.log(err));

async function main() {
    const conn = await mongoose.connect(uri);

    const genreSchema = new mongoose.Schema({
        name: String,
        url: String
    });

    const bookSchema = new mongoose.Schema({
        title: String,
        author: String, // <- this should be an Author type eventually
        summary: String,
        ISBN: String,
        genre: {type: mongoose.Schema.Types.ObjectId, ref: "Genre"}, // <- this should be a Genre Type eventually
        url: String
    });

    const kittySchema = new mongoose.Schema({
        name: String
    });

    // NOTE: methods must be added to the schema before compiling it with mongoose.model()
    kittySchema.methods.speak = function speak() {
        const greeting = this.name
        ? 'Meow name is ' + this.name
        : 'I don\'t have a name';
        console.log(greeting);
    };

    const Genre = mongoose.model("Genre", genreSchema);
    const Book = mongoose.model("Book", bookSchema);
    const Kitten = mongoose.model('Kitten', kittySchema);
    
    const silence = new Kitten({ name: 'Silence' });
    const mystery = new Genre({name:"mystery", url:"#"})
    const firstBook = new Book({
        title:"Big Adventure",
        author:"Kelly Why",
        summary: "Lorem ipsom etc",
        ISBN: "QWERTY123456",
        genre: mystery,
        url: "#"
    })
    
    try {
        // await firstBook.save(); // db.coll.insertOne()
        // console.log(firstBook.name, " added to collection...")
    } catch (error) {
        console.error(error);
    }
    
    console.log(firstBook.genre);
}
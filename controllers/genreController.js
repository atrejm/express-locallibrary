const Genre = require("../models/genre");
const Book = require("../models/book");
const asyncHandler = require("express-async-handler");
const { body, vaildationResult, validationResult } = require("express-validator");
const genre = require("../models/genre");

// Display list of all Genre.
exports.genre_list = asyncHandler(async (req, res, next) => {
  const genres = await Genre.find({})
  
  res.render("genrelist", {title: "Genres", genres: genres});
});

// Display detail page for a specific Genre.
exports.genre_detail = asyncHandler(async (req, res, next) => {
  const genre = await Genre.findById(req.params.id).exec();
  const booksInGenre = await Book.find({genre:req.params.id}, "title summary").populate("author").exec();
  
  if (genre === null) {
    // No results.
    const err = new Error("Genre not found");
    err.status = 404;
    return next(err);
  }

  res.render("genre_detail", {title: `${genre.name}`, booksInGenre: booksInGenre});
});

// Display Genre create form on GET.
exports.genre_create_get = (req, res, next) => {
  res.render("genre_form", {title: "Create Genre", genre: "", errors: false});
};

// Handle Genre create on POST.
exports.genre_create_post = [
  // Validate and sanitize the name field
  body("name", "Genre name must contain at least 3 characters")
    .trim()
    .isLength({min:3})
    .escape(),

  // Process request after validation and sanitation
  asyncHandler(async (req, res, next) => {
    // Extract the validation errors from the request 
    const errors = validationResult(req);
    console.log(req.body.name)
    // Create genre object with the escaped and trimmed data
    const genre = new Genre({name: req.body.name});

    if (!errors.isEmpty()) {
      res.render("genre_form", {title: "Create Genre", genre: genre.name, errors: errors.array()});
      return;
    } else {
      // Data from form is valid
      // Check if genre already exists
      const genreExists = await Genre.findOne({ name:req.body.name }).collation({ locale: 'en_US', strength: 2 }).exec();
      if (genreExists) {
        // Genre exists, redicect to its detail page
        res.redirect(genreExists.url);
      } else {
        console.log("Saving ", genre)
        await genre.save();
        // new genre saved, redirect to its detail page
        res.redirect(genre.url);
      }
    }
  }),
];

// Display Genre delete form on GET.
exports.genre_delete_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete GET");
});

// Handle Genre delete on POST.
exports.genre_delete_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre delete POST");
});

// Display Genre update form on GET.
exports.genre_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update GET");
});

// Handle Genre update on POST.
exports.genre_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Genre update POST");
});

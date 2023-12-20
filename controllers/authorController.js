const Author = require("../models/author");
const Book = require("../models/book");
const { DateTime } = require("luxon");
const asyncHandler = require("express-async-handler");
const { body, valitationResult, validationResult } = require("express-validator");
const { ObjectId } = require("mongodb");

// Display list of all Authors.
exports.author_list = asyncHandler(async (req, res, next) => {
  const allAuthors = await Author.find({});

  res.render("authors", {title:"Authors", authors: allAuthors});
});

// Display detail page for a specific Author.
exports.author_detail = asyncHandler(async (req, res, next) => {
  const [author, books] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({author:new ObjectId(req.params.id)})
  ]);

  console.log(books)

  res.render("author_detail", {title:"Author Detail", author:author, books:books});
});

// Display Author create form on GET.
exports.author_create_get = asyncHandler(async (req, res, next) => {
  res.render("author_form", {title: "Create new Author", author:"", errors: false});
});

// Handle Author create on POST.
exports.author_create_post = [// Validate and sanitize fields
  body("first_name")
    .trim()
    .isLength({min:1})
    .escape()
    .withMessage("First name must be specified.")
    .isAlpha()
    .withMessage("First name must be alpha, sorry Elon"),

  body("family_name")
    .trim()
    .isLength({min:1})
    .escape()
    .withMessage("Last name must be specified.")
    .isAlpha()
    .withMessage("Last name must be alpha, sorry Elon"),

  body("date_of_birth", "Invalid date of birth")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  body("date_of_death", "Invalid date of death")
    .optional({ values: "falsy" })
    .isISO8601()
    .toDate(),

  asyncHandler(async (req, res, next) => {
    const errors = validationResult(req);

    // Create Author object with escaped and trimmed data
    const author = new Author({
      first_name: req.body.first_name,
      family_name: req.body.family_name,
      date_of_birth: req.body.date_of_birth,
      date_of_death: req.body.date_of_death,
    });

    if (!errors.isEmpty()) {
      res.render("author_form", {
          title: "Create Author", 
          author: author, 
          errors: errors.array()});
    } else {
      await author.save();
      res.redirect(author.url);
    }
  }),
]

// Display Author delete form on GET.
exports.author_delete_get = asyncHandler(async (req, res, next) => {
  // Get details of author and all their books (in parallel)
  const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (author === null) {
    // No results.
    res.redirect("/catalog/authors");
  }

  res.render("author_delete", {
    title: "Delete Author",
    author: author,
    author_books: allBooksByAuthor,
  });
});


// Handle Author delete on POST.
exports.author_delete_post = asyncHandler(async (req, res, next) => {
   // Get details of author and all their books (in parallel)
   const [author, allBooksByAuthor] = await Promise.all([
    Author.findById(req.params.id).exec(),
    Book.find({ author: req.params.id }, "title summary").exec(),
  ]);

  if (allBooksByAuthor.length > 0) {
    // Author has books. Render in same way as for GET route.
    res.render("author_delete", {
      title: "Delete Author",
      author: author,
      author_books: allBooksByAuthor,
    });
    return;
  } else {
    // Author has no books. Delete object and redirect to the list of authors.
    console.log("Deleting", req.body)
    await Author.findByIdAndDelete(req.body.authorid);
    res.redirect("/catalog/authors");
  }
});

// Display Author update form on GET.
exports.author_update_get = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update GET");
});

// Handle Author update on POST.
exports.author_update_post = asyncHandler(async (req, res, next) => {
  res.send("NOT IMPLEMENTED: Author update POST");
});

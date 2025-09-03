const mongoose = require('mongoose');
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      maxLength: [40, 'A tour name must have less or equal then 40 characters'],
      minLength: [10, 'A tour name must have more or equal then 10 characters'],
      // validate: [
      //   validator.isAlpha,
      //   'Tour name must only conatin characters',
      // ],
    },
    slug: String,
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy ,medium,difficult',
      },
    },
    ratingAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating Must Have Above 1.0'],
      max: [5, 'Rating Must Have below 5.0'],
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQuantity: { type: Number },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          return val < this.price; //100
        },
        message: 'Discount price ({VALUE}) should be a regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
      required: [true, 'A tour must have a Summery'],
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [false, 'A tour must have a Image Cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false,
    },
    startDates: [Date],
    secretTour: {
      type: Boolean,
      default: false,
    },
    startLocation: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: function (val) {
            return Array.isArray(val) && val.length === 2;
          },
          message: 'Coordinates must be an array of [lng, lat]',
        },
      },
      address: String,
      description: String,
    },
    locations: [
      {
        type: {
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: {
          type: [Number],
          required: true,
        },
        address: String,
        description: String,
        day: Number,
      },
    ],
    guides: [{ type: mongoose.Schema.ObjectId, ref: 'User' }],
    // reviews: [{ type: mongoose.Schema.ObjectId, ref: 'review' }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
tourSchema.index({ price: 1, ratingAverage: -1 });
tourSchema.index({ slug: 1 });
tourSchema.index({ startLocation: '2dsphere' });
tourSchema.index({ price: 1 });

tourSchema.virtual('durationWeeks').get(function () {
  return this.duration / 7;
});

tourSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'tour',
  localField: '_id',
});

tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
// tourSchema.pre('save', async function (next) {
//   const guidesPromises = this.guides.map((id) => User.findById(id));
//   this.guides = await Promise.all(guidesPromises);
//   next();
// });

// tourSchema.pre('save', function (next) {
//   console.log('Will save the document');
//   next();
// });
// tourSchema.post('save', function (doc, next) {
//   console.log(doc);
//   next();
// });

//Query MIDDLEWARE
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});
tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-_v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (docs, next) {
  console.log(`Query took ${Date.now() - this.start} milliseconds`);
  // console.log(docs);
  next();
});

// Aggreation middleware
// tourSchema.pre('aggregate', function (next) {
//   this.pipeline().unshift({
//     $match: { secretTour: { $ne: true } },
//   });
//   // console.log(this);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);
module.exports = Tour;

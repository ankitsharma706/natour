class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString || {}; // ✅ default to empty object
  }
  filter() {
    try {
      const queryObj = { ...this.queryString };
      const excludedFields = ['page', 'sort', 'limit', 'fields'];
      excludedFields.forEach((el) => delete queryObj[el]);

      // Advanced filtering (gte, gt, lte, lt → $gte, $gt, $lte, $lt)
      let queryStr = JSON.stringify(queryObj);
      queryStr = queryStr.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`,
      );

      this.query = this.query.find(JSON.parse(queryStr));
    } catch (err) {
      // Fallback to empty filter if something goes wrong
      console.error('Filter parsing error:', err.message);
      this.query = this.query.find();
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      this.query = this.query.sort(sortBy);
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  limitFields() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  paginate() {
    const page = Number(this.queryString.page) || 1;
    const limit = Number(this.queryString.limit) || 100;
    const skip = (page - 1) * limit;

    if (skip >= 0) {
      this.query = this.query.skip(skip).limit(limit);
    }
    return this;
  }
}

module.exports = APIFeatures;

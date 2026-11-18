const Category = require('../models/Category');
const { sendSuccess, sendError } = require('../utils/apiResponse');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = async (req, res, next) => {
  try {
    const filter = {};
    if (!req.query.includeInactive) {
      filter.isActive = true;
    }
    const categories = await Category.find(filter).sort({ name: 1 });
    return sendSuccess(res, 200, 'Categories retrieved.', categories);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single category by ID or slug
// @route   GET /api/categories/:id
// @access  Public
const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let category;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      category = await Category.findById(id);
    } else {
      category = await Category.findOne({ slug: id });
    }

    if (!category) {
      return sendError(res, 404, 'Category not found.');
    }
    return sendSuccess(res, 200, 'Category retrieved.', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    if (!name) {
      return sendError(res, 400, 'Category name is required.');
    }

    const existing = await Category.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existing) {
      return sendError(res, 400, 'Category with this name already exists.');
    }

    const category = await Category.create({
      name: name.trim(),
      description: description || '',
      icon: icon || 'Briefcase',
    });

    return sendSuccess(res, 201, 'Category created successfully.', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = async (req, res, next) => {
  try {
    const { name, description, icon, isActive } = req.body;
    const category = await Category.findById(req.params.id);

    if (!category) {
      return sendError(res, 404, 'Category not found.');
    }

    if (name) category.name = name.trim();
    if (description !== undefined) category.description = description;
    if (icon) category.icon = icon;
    if (isActive !== undefined) category.isActive = isActive;

    await category.save();
    return sendSuccess(res, 200, 'Category updated successfully.', category);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return sendError(res, 404, 'Category not found.');
    }

    await Category.findByIdAndDelete(req.params.id);
    return sendSuccess(res, 200, 'Category deleted successfully.');
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

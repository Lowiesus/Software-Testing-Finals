import { Tag } from "../models/tag.js";

export const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Tag name is required",
      });
    }

    const existingTag = await Tag.findByName(name);
    if (existingTag) {
      return res.status(409).json({
        success: false,
        message: "Tag already exists",
      });
    }

    const newTag = await Tag.createTag({
      name,
      description: description || "",
      color: color || "#3b82f6",
    });

    res.status(201).json({
      success: true,
      message: "Tag created successfully",
      data: newTag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating tag",
      error: error.message,
    });
  }
};

export const getTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tag",
      error: error.message,
    });
  }
};

export const getTagByName = async (req, res) => {
  try {
    const { name } = req.params;

    const tag = await Tag.findByName(name);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    res.status(200).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tag",
      error: error.message,
    });
  }
};

export const getAllTags = async (req, res) => {
  try {
    const { limit = 50, sort = "postCount" } = req.query;

    const tags = await Tag.findAll({
      sort: { [sort]: -1 },
      limit: parseInt(limit),
    });

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tags",
      error: error.message,
    });
  }
};

export const getTopTags = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const tags = await Tag.getTopTags(parseInt(limit));

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching top tags",
      error: error.message,
    });
  }
};

export const getTagsByPopularity = async (req, res) => {
  try {
    const { limit = 20 } = req.query;

    const tags = await Tag.getTagsByPopularity(parseInt(limit));

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching tags by popularity",
      error: error.message,
    });
  }
};

export const updateTag = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    const updatedTag = await Tag.updateTag(id, {
      name,
      description,
      color,
    });

    res.status(200).json({
      success: true,
      message: "Tag updated successfully",
      data: updatedTag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating tag",
      error: error.message,
    });
  }
};

export const deleteTag = async (req, res) => {
  try {
    const { id } = req.params;

    const tag = await Tag.findById(id);
    if (!tag) {
      return res.status(404).json({
        success: false,
        message: "Tag not found",
      });
    }

    await Tag.deleteTag(id);

    res.status(200).json({
      success: true,
      message: "Tag deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting tag",
      error: error.message,
    });
  }
};

export const searchTags = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const tags = await Tag.searchTags(q);

    res.status(200).json({
      success: true,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error searching tags",
      error: error.message,
    });
  }
};

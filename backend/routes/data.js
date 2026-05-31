const express = require("express");
const router = express.Router();

const Data = require("../models/Transaksi");
const auth = require("../middleware/auth");

router.post("/add", auth, async (req, res) => {
  try {
    const data = new Data(req.body);

    await data.save();

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/data", auth, async (req, res) => {
  try {
    const data = await Data.find().sort({
      createdAt: -1,
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.get("/:id", auth, async (req, res) => {
  try {
    const data = await Data.findById(req.params.id);

    if (!data) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.put("/:id", auth, async (req, res) => {
  try {
    const updated = await Data.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
      }
    );

    if (!updated) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.delete("/:id", auth, async (req, res) => {
  try {
    const deleted = await Data.findByIdAndDelete(
      req.params.id
    );

    if (!deleted) {
      return res.status(404).json({
        message: "Data tidak ditemukan",
      });
    }

    res.json({
      message: "Data berhasil dihapus",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

router.post("/approve/:id", auth, async (req, res) => {
  try {
    const request = await Data.findById(req.params.id);

    if (!request) {
      return res.status(404).json({
        message: "Request tidak ditemukan",
      });
    }

    request.statusProduksi = "Disetujui";
    await request.save();

    await Data.create({
      barang: request.barang,
      out: request.out,
      stage: "Warehouse RM",
      operatorName: request.operatorName,
      statusProduksi: "Disetujui",
    });

    res.json({
      message: "Approval berhasil",
    });
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});

module.exports = router;
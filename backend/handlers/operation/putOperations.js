import { guard, adminGuard, businessGuard } from "../../guards.js";
import {
  IncrementalOperation,
  DailyOperation,
} from "./schemasOperations&Sales/operations.model.js";
import { getLoggedUserId } from "../../config/config.js";
import { middlewareOperations } from "../../middleware/middlewareOperations.js";
import { User } from "../users/models/user.model.js";
import {
  DailyOperationSale,
  IncrementalOperationSale,
} from "./schemasOperations&Sales/operationSale.model.js";
import { middlewareSales } from "../../middleware/middlewareSale.js";

export default (app) => {
  // update a card by id number //
app.put(
  "/api/dailyOperationAgentUpdate/:bizNumber",
  guard,
  async (req, res) => {
    const { userId, IsBusiness } = getLoggedUserId(req, res);

    if (!userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    let updateData = req.body;
    if (IsBusiness) {
      const { user_id, ...rest } = req.body; // Exclude user_id from the update data for business users
      updateData = rest;
    }

    const { error } = middlewareOperations.validate(updateData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    try {
      const toIncrementalOperation =
        await IncrementalOperation.findOneAndUpdate(
          { bizNumber: req.params.bizNumber },
          updateData, 
          { new: true }
        );

      const toDailyOperation = await DailyOperation.findOneAndUpdate(
        { bizNumber: req.params.bizNumber },
        updateData,
        { new: true }
      );

      if (!toIncrementalOperation && !toDailyOperation) {
        return res.status(404).json({ message: "Operation not found" });
      }

      res.send({ toDailyOperation, toIncrementalOperation });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);
  app.put(
    "/api/dailyOperationAgentUpdateForSale/:bizNumber",
    guard,
    async (req, res) => {
      const { userId } = getLoggedUserId(req, res);

      if (!userId) {
        return res.status(403).json({ message: "User not authorized" });
      }

      req.body.user_id = userId;

      const { error } = middlewareSales.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      try {
        const toIncrementalOperation =
          await IncrementalOperation.findOneAndUpdate(
            { bizNumber: req.params.bizNumber },
            req.body,
            { new: true }
          );

        const toDailyOperation = await DailyOperation.findOneAndUpdate(
          { bizNumber: req.params.bizNumber },
          req.body,
          { new: true }
        );

        if (!toIncrementalOperation && !toDailyOperation) {
          return res.status(404).json({ message: "Operation not found" });
        }

        res.send({ toDailyOperation, toIncrementalOperation });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    }
  );

app.put(
  "/api/dailyOperationUpdateSale/:bizNumber",
  guard,
  async (req, res) => {
    const { userId, IsBusiness } = getLoggedUserId(req, res);

    if (!userId) {
      return res.status(403).json({ message: "User not authorized" });
    }

    let updateData = req.body;
    if (IsBusiness) {
      const { user_id, ...rest } = req.body;
      updateData = rest;
    } else {
      updateData.user_id = userId;
    }

    const { error } = middlewareSales.validate(updateData);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    try {
      const toIncrementalOperationSale =
        await IncrementalOperationSale.findOne({ bizNumber: req.params.bizNumber });

      const toDailyOperationSale = await DailyOperationSale.findOne({ bizNumber: req.params.bizNumber });

      if (!toIncrementalOperationSale && !toDailyOperationSale) {
        return res.status(404).json({ message: "Operation not found" });
      }

      if (toIncrementalOperationSale.user_id.toString() !== userId && !IsBusiness) {
        return res.status(403).json({ message: "User not authorized to update this operation" });
      }

      if (toDailyOperationSale.user_id.toString() !== userId && !IsBusiness) {
        return res.status(403).json({ message: "User not authorized to update this operation" });
      }

      const updatedIncrementalOperationSale = await IncrementalOperationSale.findOneAndUpdate(
        { bizNumber: req.params.bizNumber },
        updateData,
        { new: true }
      );

      const updatedDailyOperationSale = await DailyOperationSale.findOneAndUpdate(
        { bizNumber: req.params.bizNumber },
        updateData, 
        { new: true }
      );

      const updatedIncrementalOperation = await IncrementalOperation.findOneAndUpdate(
        { user_id: updatedIncrementalOperationSale.user_id },
        updateData, 
        { new: true }
      );

      const updatedDailyOperation = await DailyOperation.findOneAndUpdate(
        { user_id: updatedDailyOperationSale.user_id },
        updateData, 
        { new: true }
      );

      res.send({ updatedDailyOperationSale, updatedIncrementalOperationSale, updatedDailyOperation, updatedIncrementalOperation });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  }
);
  // update a card bizNumber by id number //
  app.put("/api/bizNumber/:id", adminGuard, async (req, res) => {
    const newBizNumber = req.body.bizNumber;

    try {
      const card = await Operation.findOne({ bizNumber: newBizNumber });
      if (card) {
        return res.status(400).json({ message: "BizNumber is already in use" });
      }

      if (newBizNumber < 100000000 || newBizNumber > 999999999) {
        return res
          .status(400)
          .json({ message: "BizNumber must be a 9 digit number" });
      }

      const updatedCard = await Operation.findByIdAndUpdate(
        req.params.id,
        { bizNumber: newBizNumber },
        { new: true }
      );
      if (!updatedCard) {
        return res.status(404).json({ message: "Card not found" });
      }

      res.send("BizNumber updated successfully");
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  // like a card by id number //
  app.patch("/api/cardLike/:id", guard, async (req, res) => {
    const { userId } = getLoggedUserId(req, res);
    if (!userId) {
      return res.status(403).json({ message: "User not authorized" });
    } else {
      try {
        const card = await Operation.findById(req.params.id);
        if (!card) {
          return res.status(404).json({ message: "Card not found" });
        }
        const index = card.likes.indexOf(userId);
        if (index === -1) {
          card.likes.push(userId);
        } else {
          card.likes.splice(index, 1);
        }
        await card.save();
        res.send("Card updated " + card.likes);
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    }
  });
};

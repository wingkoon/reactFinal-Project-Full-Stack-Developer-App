import { guard, adminGuard, businessGuard } from "../../guards.js";
import { IncrementalOperation, DailyOperation, LoggersOperation } from "../../handlers/operation/operations.model.js";
import { getLoggedUserId } from "../../config/config.js";
import { middlewareOperations } from "../../middleware/middlewareOperations.js";
import loggersOperations from "../../loggers/loggersOperation.js";

export default (app) => {
  // get all Operations users //
  app.get("/api/allOperations", async (req, res) => {
    try {
      const operations = await IncrementalOperation.find();
      res.send(operations);
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  // get all Operation of the logged user //
  app.get("/api/incrementalOperation", guard, async (req, res) => {
    try {
      const { userId } = getLoggedUserId(req, res);

      if (!userId) {
        return res.status(403).json({ message: "User not authorized" });
      }
      const incrementalOperations = await IncrementalOperation.find({
        user_id: userId,
      });

      if (!incrementalOperations || incrementalOperations.length === 0) {
        return res
          .status(404)
          .json({ message: "No cards found for this user" });
      }
      res.send(incrementalOperations);
    } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
  // *** get a specific Operation by id test !!! ***//
    app.get("/api/operationId", guard, async (req, res) => {
      try {
        const { userId } = getLoggedUserId(req, res);

        if (!userId) {
          return res.status(403).json({ message: "User not authorized" });
        }
        const currentOperation = await DailyOperation.find({ user_id: userId });

        if (!currentOperation || currentOperation.length === 0) {
          return res
            .status(404)
            .json({ message: "No cards found for this user" });
        }
        res.send(currentOperation);
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server error", error: error.message });
      }
    });
  // get a specific Operation by id //
  app.get("/api/operationId/:id", async (req, res) => {
    try {
      const operationId = await LoggersOperation.findById(req.params.id);

      if (!operationId) {
        return res.status(404).json({ message: "operationId not found" });
      }

      res.send(operationId);
    } catch (error) {
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "Invalid operation ID" });
      }
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });

  // add a new dailyOperation and Posted //
  app.post(
    "/api/dailyOperationAgentStart",guard , async (req, res) => {
      const { userId } = getLoggedUserId(req, res);

      if (!userId) {
        return res.status(403).json({ message: "User not authorized" });
      }

      req.body.user_id = userId;

      const { error } = middlewareOperations.validate(req.body);
      if (error) {
        return res.status(400).json({ message: error.details[0].message });
      }

      const bizNumber = await IncrementalOperation.generateUniqueBizNumber();
      req.body.bizNumber = bizNumber;

      const startDayOperation = new DailyOperation(req.body);
      const incrementalOperation = new IncrementalOperation(req.body);

      try {
        const toIncrementalOperation = await incrementalOperation.save();
        const toDailyOperation = await startDayOperation.save();
        res.send({ toIncrementalOperation, toDailyOperation });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
    }
  );

  app.get("/api/getLastOperation/:userId", (req, res) => {
    const userId = req.params.userId;

    // Find the last operation of the user
    const lastOperation = operations
      .filter((operation) => operation.userId === userId)
      .sort((a, b) => b.operationTime - a.operationTime)[0];

    if (lastOperation) {
      res.json({ lastOperationTime: lastOperation.operationTime });
    } else {
      res.status(404).json({ message: "No operations found for this user." });
    }
  });
  
  // update a card by id number //
app.put("/api/dailyOperationAgentUpdate/:id", guard, async (req, res) => {
  const { userId } = getLoggedUserId(req, res);

  if (!userId) {
    return res.status(403).json({ message: "User not authorized" });
  }

  req.body.user_id = userId;

  const { error } = middlewareOperations.validate(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const toIncrementalOperation = await IncrementalOperation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    const toDailyOperation = await DailyOperation.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!toIncrementalOperation && !toDailyOperation) {
      return res.status(404).json({ message: "Operation not found" });
    }

    res.send({toDailyOperation, toIncrementalOperation });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
});
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
  // delete a card by id number //
  app.delete("/api/card/:id", businessGuard, async (req, res) => {
    try {
      const { userId, isAdmin } = getLoggedUserId(req, res);

      if (!userId) {
        return res.status(403).json({ message: "User not authorized" });
      } else {
        const card = await Operation.findById(req.params.id);

        if (!card) {
          return res.status(404).json({ message: "Card not found" });
        }

        if (card.user_id.toString() !== userId && !isAdmin) {
          return res
            .status(403)
            .json({ message: "User not authorized to delete this card" });
        }

        await Operation.findByIdAndDelete(req.params.id);
        res.send("Card deleted successfully");
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};








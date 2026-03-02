const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions/v2");

/**
 * Triggered when a new document is created in the checklists collection.
 * Logs document ID and a subset of the created data.
 */
exports.onChecklistCreated = onDocumentCreated(
  { document: "checklists/{docId}" },
  (event) => {
    const docId = event.params.docId;
    const data = event.data?.data() ?? {};

    logger.info("Checklist created", {
      docId,
      path: event.document,
    });
    logger.info("Checklist data (keys)", {
      keys: Object.keys(data),
    });
    logger.info("Checklist created — docId:", docId);
  }
);

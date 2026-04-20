const express = require("express");
const router = express.Router();

const appointmentController = require("../controller/appointment.controller");
const { verifyToken, allowRoles } = require("../middlewares/auth.middleware");
const { verifyFirebaseToken } = require("../middlewares/firebaseAuth");
/**
 * ======================
 * ADD APPOINTMENT
 * ======================
 */
router.post(
  "/",
  //verifyToken,
 // allowRoles("admin", "staff","doctor"),
 verifyFirebaseToken,
  appointmentController.createAppointment
);


/**
 * ======================
 * GET ALL APPOINTMENTS
 * ======================
 */
router.get(
  "/",
  verifyToken,
  allowRoles("admin", "staff","doctor"),
  appointmentController.getAppointments
);


/**
 * ======================
 * DOCTOR DASHBOARD
 * ======================
 */
router.get(
  "/doctor/my",
  verifyToken,
  allowRoles("doctor","admin"),
  appointmentController.getMyAppointments
);


/**
 * ======================
 * GET APPOINTMENT BY ID
 * ======================
 */
router.get(
  "/:id",
  verifyToken,
  allowRoles("admin","doctor","staff"),
  appointmentController.getAppointment
);


/**
 * ======================
 * UPDATE APPOINTMENT
 * ======================
 */
router.put(
  "/:id",
  verifyToken,
  allowRoles("admin","staff","doctor"),
  appointmentController.updateAppointment
);


/**
 * ======================
 * SEND TO CONSULTANT
 * ======================
 */
router.patch(
  "/:id/send-to-consultant",
  verifyToken,
  allowRoles("admin","staff"),
  appointmentController.sendToConsultant
);


/**
 * ======================
 * COMPLETE APPOINTMENT
 * ======================
 */
router.patch(
  "/:id/complete",
  verifyToken,
  allowRoles("doctor"),
  appointmentController.completeConsultation
);


/**
 * ======================
 * DELETE APPOINTMENT
 * ======================
 */
router.delete(
  "/:id",
  verifyToken,
  allowRoles("admin"),
  appointmentController.deleteAppointment
);


/**
 * ======================
 * GET DOCTOR QUEUE
 * ======================
 */
router.get(
  "/queue",
  verifyToken,
  allowRoles("admin","staff","doctor"),
  appointmentController.getDoctorQueue
);


/**
 * ======================
 * CALL NEXT PATIENT
 * ======================
 */
router.post(
  "/queue/next",
  verifyToken,
  allowRoles("doctor","admin"),
  appointmentController.nextPatient
);


/**
 * ======================
 * SKIP PATIENT
 * ======================
 */
router.post(
  "/queue/skip",
  verifyToken,
  allowRoles("doctor"),
  appointmentController.skipPatient
);


/**
 * ======================
 * RECALL PATIENT
 * ======================
 */
router.post(
  "/queue/recall",
  verifyToken,
  allowRoles("doctor"),
  appointmentController.recallPatient
);


module.exports = router;
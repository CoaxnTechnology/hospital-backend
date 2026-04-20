module.exports = (data) => {
  const { hospital, patient, doctor, medicines, date } = data;

  const BASE_URL = "https://hospital.clinicalgynecologists.space";

  return `
  <html>
  <head>
    <style>
      body {
        font-family: Arial;
        margin: 0;
        padding: 0;
        position: relative;
      }

      .watermark {
        position: fixed;
        top: 30%;
        left: 20%;
        opacity: 0.05;
        z-index: 0;
      }

      .watermark img {
        width: 400px;
      }

      .left-strip {
        position: fixed;
        left: 0;
        top: 0;
        width: 10px;
        height: 100%;
        background: linear-gradient(to bottom, #6a11cb, #2575fc);
      }

      .container {
        padding: 20px 30px;
        position: relative;
        z-index: 2;
      }

      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-bottom: 2px solid #000;
        padding-bottom: 10px;
      }

      .left {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .logo img {
        width: 70px;
      }

      .hospital {
        font-size: 22px;
        font-weight: bold;
        color: #333;
      }

      .right {
        text-align: right;
        font-size: 12px;
      }

      .patient-box {
        margin-top: 15px;
        border: 1px solid #ccc;
        padding: 12px;
        background: #f9f9f9;
        border-radius: 5px;
        font-size: 13px;
      }

      .row {
        display: flex;
        justify-content: space-between;
        margin-bottom: 5px;
      }

      .rx {
        font-size: 28px;
        font-weight: bold;
        margin-top: 15px;
      }

      .medicine-list {
        margin-top: 10px;
        font-size: 14px;
      }

      .medicine-item {
        margin-bottom: 8px;
      }

      .footer {
        margin-top: 50px;
        display: flex;
        justify-content: space-between;
      }

      .signature img {
        width: 120px;
      }

      .note {
        font-size: 12px;
        color: #555;
      }
    </style>
  </head>

  <body>

    <!-- WATERMARK -->
    <div class="watermark">
      <img src="${hospital?.logo}" />
    </div>

    <!-- LEFT STRIP -->
    <div class="left-strip"></div>

    <div class="container">

      <!-- HEADER -->
      <div class="header">
        <div class="left">
          <div class="logo">
            <img src="${hospital?.logo}" />
          </div>
          <div>
            <div class="hospital">${hospital?.name || "Hospital"}</div>
            <div>${hospital?.address || ""}</div>
          </div>
        </div>

        <div class="right">
          <div>Date: ${date}</div>
        </div>
      </div>

      <!-- PATIENT DETAILS -->
      <div class="patient-box">
        <div class="row">
          <div><b>Patient:</b> ${patient?.name || "N/A"}</div>
          <div><b>ID:</b> ${patient?.id || "N/A"}</div>
        </div>

        <div class="row">
          <div><b>Age:</b> ${patient?.age || "-"}</div>
          <div><b>Mobile:</b> ${patient?.mobile || "-"}</div>
        </div>

        <div class="row">
          <div><b>Doctor:</b> ${doctor?.name || "N/A"}</div>
          <div><b>Department:</b> ${doctor?.department || "General"}</div>
        </div>
      </div>

      <!-- RX -->
      <div class="rx">℞</div>

      <!-- MEDICINES -->
      <div class="medicine-list">
        ${(medicines || [])
          .map(
            (m, i) => `
          <div class="medicine-item">
            ${i + 1}. <b>${m?.name}</b> - ${m?.dosage} - ${m?.duration}
          </div>
        `,
          )
          .join("")}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="signature">
          <p><b>Doctor Signature</b></p>

          <img src="${
            doctor?.signature
              ? BASE_URL + doctor.signature
              : BASE_URL + "/uploads/static/default-signature.png"
          }" />

        </div>

        <div class="note">
          This is computer generated prescription
        </div>
      </div>

    </div>

  </body>
  </html>
  `;
};
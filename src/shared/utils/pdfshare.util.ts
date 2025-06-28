import puppeteer from "puppeteer";
import { ICourse, IUnitCourse } from "../../interfaces/icourse.interface";

const getCourseHtml = (course: ICourse): string => {
  // Aplicando los colores del frontend
  const styles = `
    body { 
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; 
      color: #2c2c2c; /* --color-text-main */
      margin: 0; 
      padding: 0; 
      background-color: #ffffff; /* --color-background */
    }
    .container { 
      margin: 40px; 
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #dddddd; /* --color-border */
      padding-bottom: 20px; 
      margin-bottom: 30px; 
    }
    h1 { 
      color: #2c2c2c; /* --color-text-main */
      font-size: 28px; 
      margin-bottom: 10px; 
    }
    h2 { 
      color: #6f6f6f; /* --color-text-secondary */
      border-bottom: 1px solid #dddddd; /* --color-border */
      padding-bottom: 8px; 
      margin-top: 35px; 
      font-size: 22px; 
    }
    .teacher { 
      font-size: 18px; 
      color: #6f6f6f; /* --color-text-secondary */
      text-align: center; 
      margin-bottom: 30px; 
      font-style: italic; 
    }
    p { 
      line-height: 1.7; 
      font-size: 16px; 
      color: #2c2c2c; /* --color-text-main */
    }
    .description { 
      background-color: #f8f5fc; /* --color-panel */
      padding: 20px; 
      border-radius: 8px; 
      margin: 20px 0; 
      border: 1px solid #dddddd; /* --color-border */
    }
    .planning-container { 
      background-color: #f8f5fc; /* --color-panel */
      padding: 15px; 
      border-radius: 8px; 
      border: 1px solid #dddddd; /* --color-border */
    }
    .unit { 
      margin-bottom: 25px; 
    }
    .unit-title { 
      font-weight: bold; 
      font-size: 18px; 
      color: #2c2c2c; /* --color-text-main */
      margin-bottom: 10px; 
      background-color: #d6c3ff; /* --color-hover */
      padding: 8px 12px; 
      border-radius: 5px; 
    }
    .section { 
      margin-left: 20px; 
      margin-bottom: 8px; 
    }
    .section-title { 
      padding: 5px 10px; 
      background-color: #ffffff; /* --color-background */
      border-radius: 4px; 
      border: 1px solid #dddddd; /* --color-border */
      color: #6f6f6f; /* --color-text-secondary */
    }
    pre { 
      white-space: pre-wrap; 
      font-family: monospace; 
      background-color: #ffffff; /* --color-background */
      padding: 15px; 
      border-radius: 6px; 
      border: 1px solid #dddddd; /* --color-border */
      font-size: 14px;
      color: #6f6f6f; /* --color-text-secondary */
    }
  `;

  const renderPlanning = () => {
    if (!course.planning) {
      return "<p>No hay planificación disponible para este curso.</p>";
    }

    try {
      let planningData;

      if (typeof course.planning === "string") {
        try {
          planningData = JSON.parse(course.planning);
        } catch (parseError) {
          try {
            const fixedJsonString = course.planning.replace(/(\w+):/g, '"$1":');
            planningData = JSON.parse(fixedJsonString);
          } catch (fixError) {
            console.error("No se pudo arreglar el JSON:", fixError);
            return "<p>Error al procesar la planificación del curso.</p>";
          }
        }
      } else {
        planningData = course.planning;
      }

      if (Array.isArray(planningData)) {
        return planningData
          .map(
            (unit: IUnitCourse, index: number) => `
          <div class="unit">
            <div class="unit-title">Unidad ${index + 1}: ${unit.title}</div>
            ${
              unit.sections && Array.isArray(unit.sections)
                ? unit.sections
                    .map(
                      (section, sectionIndex) => `
                <div class="section">
                  <div class="section-title">${sectionIndex + 1}. ${
                        section.title
                      }</div>
                </div>
              `
                    )
                    .join("")
                : '<div class="section">No hay secciones definidas</div>'
            }
          </div>
        `
          )
          .join("");
      } else {
        return `<pre>${JSON.stringify(planningData, null, 2)}</pre>`;
      }
    } catch (error) {
      console.error("Error al procesar la planificación:", error);
      return `<p>Error al procesar la planificación del curso.</p>`;
    }
  };

  return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Informe del Curso: ${course.title}</title>
            <style>${styles}</style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>${course.title}</h1>
                    <p class="teacher">Profesor: ${course.teacher}</p>
                </div>

                <h2>Descripción del Curso</h2>
                <div class="description">
                    <p>${
                      course.description || "Este curso no tiene descripción."
                    }</p>
                </div>
                
                <h2>Planificación del Curso</h2>
                <div class="planning-container">
                    ${renderPlanning()}
                </div>
            </div>
        </body>
        </html>
    `;
};

export const generateCoursePdf = async (course: ICourse): Promise<Buffer> => {
  const htmlContent = getCourseHtml(course);
  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  await page.setContent(htmlContent, { waitUntil: "networkidle0" });

  const pdfBuffer = await page.pdf({
    format: "A4",
    printBackground: true,
    margin: {
      top: "20mm",
      right: "20mm",
      bottom: "20mm",
      left: "20mm",
    },
  });

  await browser.close();
  return Buffer.from(pdfBuffer);
};

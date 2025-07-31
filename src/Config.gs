// @flow
/**
 * Global configuration constants for invoice automation.
 * @const
 */
var CONFIG = {
  COMPANY_NAME: "Devops Consultoria e Desenvolvimento de Softwares LTDA",
  COMPANY_ADDRESS:
    "Av. Paulista, 1636, 15º Andar, CJ 04, São Paulo – SP, 01310-200",
  CNPJ: "54566671000143",
  IM: "13006525",
  PDF_FOLDER_ID: "1roHYH7e5g0CcnLsKa_QWdjnJ0hBmo6Fh",
  COLOR_BLUE: "#003B70"
};

// Lazily load sensitive values from Script Properties
var SCRIPT_PROPERTIES = PropertiesService.getScriptProperties();

/**
 * Returns the NFSe API token stored in Script Properties.
 * @return {string?} token value or null if not set
 */
function getNFSeToken() {
  return SCRIPT_PROPERTIES.getProperty("NFSE_TOKEN");
}

/**
 * Returns the PIX QR code URL stored in Script Properties.
 * @return {string?} QR code image URL or null if not set
 */
function getPixQrUrl() {
  return SCRIPT_PROPERTIES.getProperty("PIX_QR_URL");
}

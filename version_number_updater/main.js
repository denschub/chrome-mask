import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const API_HOST = "https://versionhistory.googleapis.com";
const API_PATH = "v1/chrome/platforms/win64/channels/stable/versions/all/releases";
const API_SEARCH_PARAMS = new URLSearchParams([
  ["order_by", "starttime desc"],
  ["filter", "fraction=1"],
]);

const REMOTE_STORAGE_HOST = "https://chrome-mask-remote-storage.0b101010.services";
const REMOTE_STORAGE_PATH = "current-chrome-major-version.txt";

async function run() {
  const { S3_ACCESS_KEY_ID, S3_BUCKET, S3_ENDPOINT, S3_SECRET_ACCESS_KEY } = process.env;

  if (!(S3_ACCESS_KEY_ID && S3_BUCKET && S3_ENDPOINT && S3_SECRET_ACCESS_KEY)) {
    throw new Error("missing env vars. required: S3_ACCESS_KEY_ID, S3_BUCKET, S3_ENDPOINT, S3_SECRET_ACCESS_KEY");
  }

  try {
    console.info("starting update");
    const apiRequestUrl = new URL(API_PATH, API_HOST);
    apiRequestUrl.search = API_SEARCH_PARAMS.toString();

    console.info("fetching current version from the Google API");
    const apiResponseRaw = await fetch(apiRequestUrl);
    const apiResponse = await apiResponseRaw.json();

    const currentVersion = apiResponse.releases[0].version;
    const currentMajor = currentVersion.split(".")[0];
    console.info(`got response. current major: ${currentMajor}`);

    console.info("fetching current remote settings value");
    const storageRequestUrl = new URL(REMOTE_STORAGE_PATH, REMOTE_STORAGE_HOST);
    const storageResponseRaw = await fetch(storageRequestUrl);
    const storageResponse = (await storageResponseRaw.text()).trim();

    if (storageResponse == currentMajor) {
      console.info("remote settings are up-to-date, bailing");
      return;
    }

    console.info(`remote settings show version ${storageResponse}, update required`);

    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${S3_ENDPOINT}`,
      credentials: {
        accessKeyId: S3_ACCESS_KEY_ID,
        secretAccessKey: S3_SECRET_ACCESS_KEY,
      },
    });

    console.info("pushing new version number to remote storage");
    const putObjectCommand = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: REMOTE_STORAGE_PATH,
      ContentType: "text/plain",
      Body: currentMajor,
    });
    const response = await S3.send(putObjectCommand);

    console.info(`success, version_id=${response.VersionId}`);
  } catch (ex) {
    console.error("update task failed");
    throw ex;
  }
}

run();

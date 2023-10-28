// Import from app/package.json
import appPackageJson from '../package.json';

//Import from lib/package.json
// @ts-ignore
import libPackageJson from '../../lib/package.json';

// https://stackoverflow.com/questions/55753163/package-json-is-not-under-rootdir/61467483#61467483
export function run(): void {
    console.log(`App name "${appPackageJson.name}" with version ${appPackageJson.version}`);
    console.log(`Lib name "${libPackageJson.name}" with version ${libPackageJson.version}`);
}

run();

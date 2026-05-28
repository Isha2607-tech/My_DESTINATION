const fs = require('fs');
let c = fs.readFileSync('frontend/src/services/apiService.js', 'utf8');

const target1 = "} else if (path.startsWith('/admin')) {";
const replacement1 = "} else if (path.startsWith('/admin') || path.startsWith('/cms-admin')) {";

const target2 = "effectiveToken = adminToken || token;";
const replacement2 = "effectiveToken = localStorage.getItem('cmsToken') || adminToken || token;";

c = c.replace(target1, replacement1);
c = c.replace(target2, replacement2);

fs.writeFileSync('frontend/src/services/apiService.js', c);
console.log("Done");

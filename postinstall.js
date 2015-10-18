var path = require("path");
var fs = require("fs");
var osFilter = require("os-filter-obj");
var https = require("follow-redirects").https;
var tar = require("tar");
var zlib = require("zlib");
var version = require(path.join(__dirname, "package.json")).version;
var mappings = require(path.join(__dirname, "binaries.json"));
var applicableBinaries = osFilter(mappings.binaries)[0];
var distDir = "dist";
var expectedExecutables = [
  "elm", "elm-make", "elm-repl", "elm-package", "elm-reactor"
];

if (!applicableBinaries) {
  console.error("There are currently no Elm Platform binaries available for your operating system and architecture.")

  process.exit(1);
}

if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir);
}

var filename = applicableBinaries.filename;
var url = "https://dl.bintray.com/elmlang/elm-platform/"
  + version + "/" + filename;

console.log("Downloading " + url);

https.get(url, function(response) {
  var untar = tar.Extract({path: distDir, strip: 1})
    .on("error", function(error) {
      console.error("Error extracting", filename, error);
      process.exit(1);
    })
    .on("end", function() {
      expectedExecutables.forEach(function(executable) {
        console.log("Dist Dir: ", distDir, "-->", fs.readdirSync(distDir));
        console.log("bin dir: ", (__dirname + "/../.bin"), "-->", fs.readdirSync((__dirname + "/../.bin")));
        if (!fs.existsSync(path.join(distDir, executable))) {
          console.error("Error extracting executables...");
          console.error("Expected these executables to be in", distDir, " - ", expectedExecutables);
          console.error("...but got these contents instead:", fs.readdirSync(distDir));

          process.exit(1);
        }
      });
      console.log("Successfully downloaded and processed", filename);
    });

  var gunzip = zlib.createGunzip()
    .on("error", function(error) {
      console.error("Error decompressing", filename, error);
      process.exit(1);
    });

  response.on("error", function(error) {
    console.error("Error receiving", url);
    process.exit(1);
  }).pipe(gunzip).pipe(untar);
}).on("error", function(error) {
  console.error("Error communicating with URL ", url, error);
  process.exit(1)
});

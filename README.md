# WaterPersistence-EarthEngine
Water persistence from different satellites using Earth Engine

> https://bharathk113.github.io

![GitHub stars](https://img.shields.io/github/stars/bharathk113/bharathk113.github.io)
![GitHub forks](https://img.shields.io/github/forks/bharathk113/bharathk113.github.io)
[![Maintenance](https://img.shields.io/badge/maintained-yes-green.svg)](https://github.com/bharathk113/bharathk113.github.io/commits/master)
[![Website shields.io](https://img.shields.io/badge/website-up-yellow)](http://bharathk113.github.io/)
[![Ask Me Anything !](https://img.shields.io/badge/ask%20me-linkedin-1abc9c.svg)](https://www.linkedin.com/in/bharath-reddy-k/)
[![License](http://img.shields.io/:license-mit-blue.svg?style=flat-square)](http://badges.mit-license.org)

:star: Star me on GitHub — it helps!


Add this whenever you need to export any layer to your google drive
````
Export.image.toDrive({
 image: image_to_export,
 description: 'description',
 scale: 10,
 region: roi
});
````
## Sentinel-2:
- Water Persistance and Max water spread area for the selected time period are two output layers. 
- User inputs: 1. Lon,Lat 2. Buffer 3. Date Range 4. Threshold for misclassfication
- NDWI and MNDWI along with reflectance in multiple bands are used for water classification. 
- A threshold to account for rare (5%-10%) misclassifications added

[Link to ccde on Earth Engine](https://code.earthengine.google.co.in/?scriptPath=users%2Fbharathkadapala%2FTools%3ASentinel-2-Waterbodies)

## Landsat-8:
- Water Persistance and Max water spread area for the selected time period are two output layers. 
- User inputs: 1. Lon,Lat 2. Buffer 3. Date Range 4. Threshold for misclassfication
- NDWI and MNDWI along with reflectance in multiple bands are used for water classification. 
- A threshold to account for rare (5%-10%) misclassifications added
- This might take more time than the Sentinel-2 as some front end computation is introduced to handle the nodata issues. Interested users may contribute to eliminate that part. Thanks in advance

[Link to code on Earth Engine](https://code.earthengine.google.co.in/?scriptPath=users%2Fbharathkadapala%2FTools%3ALandsat-8-Waterbodies)

## Sentinel-1:
- Water Persistance and Max water spread area for the selected time period are two output layers. 
- User inputs: 1. Lon,Lat 2. Buffer 3. Date Range 4. Threshold for misclassfication
- A simple band thresholding is used to generate the data. Both VV & VH are considered separately while thresholding. 
- A threshold to account for rare (5%-10%) misclassifications added

[Link to ccde on Earth Engine](https://code.earthengine.google.co.in/?scriptPath=users%2Fbharathkadapala%2FTools%3ASentinel-1-Waterbodies)

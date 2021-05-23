# WaterPersistence-EarthEngine
Water persistence from different satellites using Earth Engine
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

## Landsat-8:
- Water Persistance and Max water spread area for the selected time period are two output layers. 
- User inputs: 1. Lon,Lat 2. Buffer 3. Date Range 4. Threshold for misclassfication
- NDWI and MNDWI along with reflectance in multiple bands are used for water classification. 
- A threshold to account for rare (5%-10%) misclassifications added
- This might take more time than the Sentinel-2 as some front end computation is introduced to handle the nodata issues. Interested users may contribute to eliminate that part. Thanks in advance

## Sentinel-1:
- Water Persistance and Max water spread area for the selected time period are two output layers. 
- User inputs: 1. Lon,Lat 2. Buffer 3. Date Range 4. Threshold for misclassfication
- A simple band thresholding is used to generate the data. Both VV & VH are considered separately while thresholding. 
- A threshold to account for rare (5%-10%) misclassifications added

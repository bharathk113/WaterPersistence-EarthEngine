# WaterPersistence-EarthEngine
Water persistence from different satellites using Earth Engine

## Sentinel-2:
- Water Persistance and Max water spread area for the selected time period are two output layers. 
- User inputs: 1. Lon,Lat 2. Buffer 3. Date Range 4. Threshold for misclassfication
- NDWI and MNDWI along with reflectance in multiple bands are used for water classification. 
- A threshold to account for rare (5%-10%) misclassifications added


function updateDocuments() {
  let totalUpdated = 0;
  
  // Get all databases
  const dbs = db.adminCommand('listDatabases').databases;
  
  for (const database of dbs) {
    const dbName = database.name;
    
    // Skip admin and config databases
    if (dbName === 'admin' || dbName === 'config' || dbName === 'local') continue;
    
    const currentDb = db.getSiblingDB(dbName);
    const collections = currentDb.getCollectionNames();
    
    for (const collectionName of collections) {
      const collection = currentDb[collectionName];
      let collectionUpdated = 0;
      
      // Find all documents in the collection
      const cursor = collection.find({});
      
      cursor.forEach(doc => {
        let updated = false;
        let updates = {};
        
        // Recursive function to process all fields in the document
        function processObject(obj, path) {
          if (!obj) return;
          
          for (let key in obj) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof obj[key] === 'string' && obj[key].includes('https://seedsbits.blob.core.windows.net/output-original ')) {
              updates[currentPath] = obj[key].replace(/https:\/\/seedsblob\.blob\.core\.windows\.net/g, '');
              updated = true;
            } else if (obj[key] !== null && typeof obj[key] === 'object') {
              processObject(obj[key], currentPath);
            }
          }
        }
        
        processObject(doc, '');
        
        if (updated) {
          collection.updateOne({ _id: doc._id }, { $set: updates });
          collectionUpdated++;
        }
      });
      
      totalUpdated += collectionUpdated;
      print(`Updated ${collectionUpdated} documents in ${dbName}.${collectionName}`);
    }
  }
  
  return `Total documents updated: ${totalUpdated}`;
}

updateDocuments();

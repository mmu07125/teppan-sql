importScripts('sql-asm.js');
let engine;
self.onmessage = async ({data}) => {
  let db;
  try {
    engine ||= initSqlJs();
    const SQL = await engine;
    db = new SQL.Database();
    db.run(data.seed);
    const start = performance.now();
    const results = [];
    for (const statement of db.iterateStatements(data.sql)) {
      const columns = statement.getColumnNames();
      const values = [];
      let total = 0;
      while (statement.step()) {
        total++;
        if (values.length < 500) values.push(statement.get());
      }
      if (columns.length) results.push({columns,values,total});
    }
    self.postMessage({results,ms:Math.round(performance.now()-start)});
  } catch (e) { self.postMessage({error:e.message}); }
  finally { if(db) db.close(); }
};

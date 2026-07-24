"use client";

import { useEffect, useState } from "react";

export default function ReviewReport() {
const [report, setReport] = useState<any>(null);

useEffect(() => {
loadReport();
}, []);

async function loadReport() {
const res = await fetch("/api/mission-control/review");
const data = await res.json();
setReport(data);
}

async function reviewAction(
action: "approve" | "reject",
item: any
) {
await fetch("/api/mission-control/review/action", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
action,
item,
}),
});

loadReport();

}

async function applySelected() {
const res = await fetch("/api/mission-control/review/apply", {
method: "POST",
headers: {
"Content-Type": "application/json",
},
body: JSON.stringify({
items: report.items,
}),
});

const data = await res.json();  

alert(  
  `Applied: ${data.applied}\nSkipped: ${data.skipped}`  
);  

loadReport();

}

if (!report) {
return <div>Loading Review Report...</div>;
}

return (
<div className="rounded-xl border p-4 space-y-3">
<h2 className="text-xl font-bold">
Review Report
</h2>

<button  
    className="rounded bg-blue-600 px-4 py-2 text-white"  
    onClick={applySelected}  
  >  
    Apply Selected  
  </button>  

  <div>Total: {report.total}</div>  
  <div>Pending: {report.pending}</div>  
  <div>Approved: {report.approved}</div>  
  <div>Rejected: {report.rejected}</div>  

  <div className="space-y-2">  
    {report.items?.slice(0, 20).map((item: any) => (  
      <div  
        key={item.id}  
        className="border rounded-lg p-3 space-y-2"  
      >  
        <div className="font-semibold">  
          {item.title}  
        </div>  

        <div>{item.description}</div>  

        <div className="text-sm opacity-70">  
          {item.file}  
        </div>  

        <div className="text-xs">  
          Status: {item.status}  
        </div>  

        <div className="flex gap-2">  
          <button  
            className="rounded bg-green-600 px-3 py-1 text-white"  
            onClick={() => reviewAction("approve", item)}  
          >  
            Approve  
          </button>  

          <button  
            className="rounded bg-red-600 px-3 py-1 text-white"  
            onClick={() => reviewAction("reject", item)}  
          >  
            Reject  
          </button>  
        </div>  
      </div>  
    ))}  
  </div>  
</div>

);
}

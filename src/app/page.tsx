"use client";

import { useEffect, useState } from "react";
import { Advocate } from "@/db/schema";
import { MagnifyingGlassIcon, XMarkIcon } from "@heroicons/react/16/solid";

export default function Home() {
	// update state defs with new type
	const [advocates, setAdvocates] = useState<Advocate[]>([]);
	const [filteredAdvocates, setFilteredAdvocates] = useState<Advocate[]>([]);
	const [searchTerm, setSearchTerm] = useState("");
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		const ctrl = new AbortController();
		const timer = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: searchTerm,
          limit: "25",
          offset: "0",
        });
        const res = await fetch(`/api/advocates?${params}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`Http ${res.status}`);
        const json = await res.json();
        setFilteredAdvocates(json.data);
      } catch(err: any) {
        if (err?.name !== "AbortError") console.error('Fetch advocates failed:', err) 
      }


		}, 250); // debounce
		return () => {
			ctrl.abort();
			clearTimeout(timer);
		};
	}, [searchTerm]);

	return (
		<main>
			<div className="border border-brand-green/30 bg-brand-green/5 p-4">
				<h1 className="text-2xl font-semibold text-brand-green">
					Solace Advocates
				</h1>
			</div>
			<div style={{ margin: "24px" }}>
				<div>
					<div className="relative max-w-md">
						{/* Search input */}
						<input
							id="advocate-search"
							type="text"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Escape" && searchTerm)
									setSearchTerm("");
							}}
							placeholder="Search advocates…"
							className="search-input"
						/>

						{/* Left: search icon */}
						<MagnifyingGlassIcon className="search-icon"></MagnifyingGlassIcon>

						{/* Clear button */}
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchTerm("")}
                className="clear-button"
              >
                <XMarkIcon className="h-5 w-5 text-slate-600" />
              </button>
            )}
					</div>
				</div>
				<br />
				<table className="table-base">
					<thead className="table-head">
						{/* fix the hydration error where th cannot be a child of thead by adding in a tr */}
						<tr>
							<th scope="col" className="th-base">
								First Name
							</th>
							<th scope="col" className="th-base">
								Last Name
							</th>
							<th scope="col" className="th-base">
								City
							</th>
							<th scope="col" className="th-base">
								Degree
							</th>
							<th scope="col" className="th-base">
								Specialties
							</th>
							<th scope="col" className="th-base">
								Years of Experience
							</th>
							<th scope="col" className="th-base">
								Phone Number
							</th>
						</tr>
					</thead>
					<tbody className="divide-y divide-slate-200">
						{filteredAdvocates.map((advocate, i) => {
							return (
								<tr key={i} className="tr-hover">
									<td className="td-base">
										{advocate.firstName}
									</td>
									<td className="td-base">
										{advocate.lastName}
									</td>
									<td className="td-base">
										{advocate.city}
									</td>
									<td className="td-base">
										{advocate.degree}
									</td>
									<td className="td-base">
										<div className="flex flex-wrap gap-1">
											{advocate.specialties.sort().map((s) => (
												<span
													key={s}
													className="badge badge-gold"
												>
													{s}
												</span>
											))}
										</div>
									</td>
									<td className="td-base">
										{advocate.yearsOfExperience}
									</td>
									<td className="td-base">
										{advocate.phoneNumber}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>
		</main>
	);
}

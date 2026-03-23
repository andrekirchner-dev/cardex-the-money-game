export interface PokemonCard { id:string; name:string; images:{small:string;large:string}; set:{name:string;series:string}; rarity?:string; cardmarket?:{prices?:{averageSellPrice?:number;lowPrice?:number;trendPrice?:number}}; tcgplayer?:{prices?:{holofoil?:{market?:number};normal?:{market?:number};reverseHolofoil?:{market?:number}}} }

export interface ScryfallCard { id:string; name:string; set_name:string; set:string; rarity:string; image_uris?:{small:string;normal:string;large:string}; card_faces?:Array<{image_uris?:{small:string;normal:string}}>; prices:{usd?:string|null;usd_foil?:string|null;eur?:string|null;eur_foil?:string|null}; purchase_uris?:{tcgplayer?:string;cardmarket?:string} }

export interface TCGDexCard { id:string; localId:string; name:string; image?:string; set?:{name:string;id:string}; rarity?:string }

export interface MercadoLivreItem { id:string; title:string; price:number; currency_id:string; condition:string; thumbnail:string; permalink:string; seller:{id:number;nickname?:string} }

export interface MercadoLivreResponse { results:MercadoLivreItem[]; paging:{total:number} }

export interface PokeTraceCard { id:string; name:string; set:string; number:string; image?:string; tcgplayer?:{market?:number;low?:number}; ebay?:{sold?:number;recent?:number}; cardmarket?:{trend?:number;low?:number} }

export interface CardMarketTCGCard { id:string|number; name:string; name_numbered?:string; card_number?:string; rarity?:string; image?:string; episode?:{id:number;name:string;code?:string}; artist?:{id:number;name:string}; prices?:{cardmarket?:{currency:"EUR";avg?:number;low?:number;trend?:number;de?:number;fr?:number;es?:number;it?:number;avg_foil?:number;low_foil?:number;lowest_near_mint?:number;lowest_near_mint_DE?:number;lowest_near_mint_FR?:number;lowest_near_mint_ES?:number;lowest_near_mint_IT?:number;"30d_average"?:number;graded?:{psa?:{psa10?:number;psa9?:number};cgc?:{cgc10?:number;cgc9?:number}}};tcgplayer?:{currency:"USD";market?:number;low?:number;avg?:number;high?:number;market_foil?:number};tcg_player?:{currency:"USD";market_price?:number;low?:number;avg?:number;high?:number;market_foil?:number};graded?:{psa_10?:number;psa_9?:number;psa_8?:number;cgc_10?:number;cgc_9?:number}} }

async function safeFetch<T>(url:string, label:string, options?:RequestInit):Promise<T> { const res=await fetch(url,options); if(!res.ok) throw new Error(`[${label}] HTTP ${res.status}`); return res.json() as Promise<T>; }

export function getPokemonPrice(card:PokemonCard):{usd:number|null;eur:number|null} { const usd=card.tcgplayer?.prices?.holofoil?.market??card.tcgplayer?.prices?.normal?.market??card.tcgplayer?.prices?.reverseHolofoil?.market??null; const eur=card.cardmarket?.prices?.averageSellPrice??card.cardmarket?.prices?.trendPrice??null; return {usd,eur}; }

export function getScryfallImage(card:ScryfallCard):string|undefined { return card.image_uris?.small??card.card_faces?.[0]?.image_uris?.small; }

export function formatUSD(v:number|null|undefined){return v!=null?`$${v.toFixed(2)}`:null}

export function formatEUR(v:number|null|undefined){return v!=null?`€${v.toFixed(2)}`:null}

export function formatBRL(v:number|null|undefined){return v!=null?`R$${v.toFixed(2)}`:null}

const POKEMON_BASE="https://api.pokemontcg.io/v2"; const POKEMON_FIELDS="id,name,images,set,rarity,cardmarket,tcgplayer";

export async function searchPokemonCards(query:string,pageSize=20):Promise<PokemonCard[]> { const apiKey=import.meta.env.VITE_POKEMON_TCG_API_KEY; const headers:Record<string,string>=apiKey?{"X-Api-Key":apiKey}:{}; const url=`${POKEMON_BASE}/cards?q=name:*${encodeURIComponent(query)}*&pageSize=${pageSize}&select=${POKEMON_FIELDS}`; const res=await fetch(url,{headers}); if(!res.ok) throw new Error(`[PokémonTCG] HTTP ${res.status}`); const data=await res.json(); return (data.data??[]) as PokemonCard[]; }

export async function getFeaturedPokemonCards():Promise<PokemonCard[]> { return searchPokemonCards("charizard",6); }

const SCRYFALL_BASE="https://api.scryfall.com";

export async function searchScryfallCards(query:string,pageSize=20):Promise<ScryfallCard[]> { const q=encodeURIComponent(query); const data=await safeFetch<{data:ScryfallCard[];has_more:boolean}>(`${SCRYFALL_BASE}/cards/search?q=${q}&unique=cards&order=usd&page=1`,"Scryfall"); return (data.data??[]).slice(0,pageSize); }

export async function searchTCGDexCards(query:string,_pageSize=20):Promise<TCGDexCard[]> { const data=await safeFetch<TCGDexCard[]>(`https://api.tcgdex.net/v2/en/cards?name=${encodeURIComponent(query)}`,"TCGDex"); return (data??[]).slice(0,_pageSize); }

const ML_BASE="https://api.mercadolibre.com";

export async function searchMercadoLivre(query:string,limit=10):Promise<MercadoLivreItem[]> { const data=await safeFetch<MercadoLivreResponse>(`${ML_BASE}/sites/MLB/search?q=${encodeURIComponent(query)}&limit=${limit}&sort=relevance`,"MercadoLivre"); return data.results??[]; }

export function calcMLStats(items:MercadoLivreItem[]):{avg:number;low:number;count:number}|null { if(!items.length) return null; const prices=items.map(i=>i.price).sort((a,b)=>a-b); const median=prices[Math.floor(prices.length/2)]; const filtered=prices.filter(p=>p<=median*10&&p>=median*0.1); if(!filtered.length) return null; const avg=filtered.reduce((s,v)=>s+v,0)/filtered.length; return {avg,low:filtered[0],count:filtered.length}; }

const POKETRACE_KEY=import.meta.env.VITE_POKETRACE_API_KEY??""; const POKETRACE_BASE="https://api.poketrace.com/v1";

export async function searchPokeTrace(query:string):Promise<PokeTraceCard[]|null> { if(!POKETRACE_KEY) return null; return safeFetch<PokeTraceCard[]>(`${POKETRACE_BASE}/cards?name=${encodeURIComponent(query)}&limit=20`,"PokeTrace",{headers:{"X-API-Key":POKETRACE_KEY}}); }

const CM_BASE="https://cardmarket-api-tcg.p.rapidapi.com"; const CM_KEY=import.meta.env.VITE_CARDMARKET_RAPIDAPI_KEY||"0d993e5135msh71c856c06b335aep1360a2jsnddde102c316c";

const CM_HEADERS={"x-rapidapi-host":"cardmarket-api-tcg.p.rapidapi.com","x-rapidapi-key":CM_KEY,"Content-Type":"application/json"};

interface CMResponse{data:CardMarketTCGCard[];meta?:{total:number;page:number}}

export async function searchCardMarketCards(query:string,game:"pokemon"|"magic"|"lorcana"|"star-wars"="pokemon",limit=20):Promise<CardMarketTCGCard[]> { if(!CM_KEY){console.warn("[CardMarket] API key não configurada");return [];} const data=await safeFetch<CMResponse>(`${CM_BASE}/${game}/cards?search=${encodeURIComponent(query)}&limit=${limit}&sort=price_highest`,"CardMarket",{headers:CM_HEADERS}); return data.data??[]; }

export async function getCardMarketEpisodeCards(episodeId:number,game:"pokemon"|"magic"|"lorcana"|"star-wars"="pokemon",sort:"price_highest"|"price_lowest"|"name"="price_highest"):Promise<CardMarketTCGCard[]> { if(!CM_KEY) return []; const data=await safeFetch<CMResponse>(`${CM_BASE}/${game}/episodes/${episodeId}/cards?sort=${sort}`,"CardMarket",{headers:CM_HEADERS}); return data.data??[]; }

export function getCardMarketPriceSummary(card:CardMarketTCGCard){const cm=card.prices?.cardmarket as any;const tcp=card.prices?.tcgplayer as any;const tcp2=card.prices?.tcg_player as any;const g=card.prices?.graded;return{eur_avg:cm?.lowest_near_mint??cm?.["30d_average"]??cm?.avg??cm?.trend??null,eur_low:cm?.low??null,eur_es:cm?.lowest_near_mint_ES??cm?.es??null,eur_de:cm?.lowest_near_mint_DE??cm?.de??null,eur_fr:cm?.lowest_near_mint_FR??cm?.fr??null,eur_foil:cm?.avg_foil??null,usd_market:tcp2?.market_price??tcp?.market??tcp?.avg??null,usd_low:tcp2?.low??tcp?.low??null,usd_foil:tcp?.market_foil??null,psa10:cm?.graded?.psa?.psa10??g?.psa_10??null,psa9:cm?.graded?.psa?.psa9??g?.psa_9??null,cgc10:cm?.graded?.cgc?.cgc10??g?.cgc_10??null};}

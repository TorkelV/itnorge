(ns itnorge.core
  (:require [compojure.core :refer :all]
            [clojure.data.json :as json]
            [clojure.string :as cstr]
            [compojure.route :as route]
            [clojure.java.io :as io]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]
            [ring.util.response :as resp]))

;;clojure.walk/keywordize-keys
(defn keywordize-keys [m]
  (let [f (fn [[k v]] (if (string? k) [(keyword k) v] [k v]))]
    (clojure.walk/postwalk (fn [x] (if (map? x) (into {} (map f x)) x)) m)))

(def year-zero-map '{"2018" 0 "2017" 0 "2016" 0 "2015" 0 "2014" 0 "2013" 0 "2012" 0 "2011" 0 "2010" 0 "2009" 0 "2008" 0 "2007" 0 "2006" 0 "2005" 0 "2004" 0 "2003" 0 "2002" 0})

(defn rj [f]
  (keywordize-keys (json/read-str (slurp (io/input-stream (io/resource (str "db/" f)))))))


(def KEYWORDS  (rj "keywords"))
(def BUSINESSES (rj "businesses"))
(def KEYWORDSPLAIN (sort-by cstr/lower-case(rj "keywordsplain")))

(defn keywords [ks]
  (if (empty? ks) KEYWORDS
                  (select-keys KEYWORDS (map keyword ks))))

(defn businesses [orgnumbers]
  (if (empty? orgnumbers) BUSINESSES
                          (filter (fn [v] (some #(= (:business_orgnr v) %) orgnumbers)) BUSINESSES)))



(defn line-chart-data-keywords [data k]
  (->> data
       (map (fn [v] (assoc '{} :name (name (first v)) :data (last v))))
       (map (fn [v] (update v :data (fn [c] (map #(assoc '{} (:year %) (k %)) c)))))
       (map (fn [v] (update v :data #(into {} %))))
       (map (fn [v] (update v :data #(merge year-zero-map %))))
       (sort-by #(cstr/lower-case (:name %)))
       ))


(defn split-params [s]
  (cstr/split s #"!"))


(defroutes app
           (GET "/businesses/:orgnumbers" [orgnumbers :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (businesses (split-params orgnumbers)))})
           (GET "/keywords/:ks" [ks :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (keywords (split-params ks)))})
           (GET "/keywordsplain/" [ks :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str KEYWORDSPLAIN)})
           (GET "/linechart-keywords/:val/:ks/:all/" [val ks all]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (line-chart-data-keywords (keywords (split-params ks)) (cond
                                                                                                (= val "percent") (if (read-string all) :percent_all :percent)
                                                                                                (= val "freq") :freq
                                                                                                :else :percent)))})
           (GET "/linechart-keywords-freq/:ks/" [ks]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (line-chart-data-keywords (keywords (split-params ks)) :freq))})
           (GET "/" []
             (resp/content-type (resp/resource-response "index.html" {:root "public"}) "text/html"))
           (route/resources "/")
           (route/not-found "<h1>Page not found</h1>"))










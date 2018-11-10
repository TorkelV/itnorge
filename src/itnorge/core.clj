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

(defn rj [f]
  (keywordize-keys (json/read-str (slurp (io/input-stream (io/resource (str "db/" f)))))))


(def KEYWORDS (rj "keywords"))
(def BUSINESSES (rj "businesses"))
(def KEYWORDSPLAIN (rj "keywordsplain"))

(defn keywords [ks]
  (if (empty? ks) KEYWORDS
                  (select-keys KEYWORDS (map keyword ks))))

(defn businesses [orgnumbers]
  (if (empty? orgnumbers) BUSINESSES
                          (filter (fn [v] (some #(= (:business_orgnr v) %) orgnumbers)) BUSINESSES)))


(defn line-chart-data-keywords [data]
  (->> data
       (map (fn [v] (assoc '{} :name (name (first v)) :data (last v))))
       (map (fn [v] (update v :data (fn [c] (map #(assoc '{} (:year %) (:precent %)) c)))))
       (map (fn [v] (update v :data #(into {} %))))))

(defn line-chart-data-keywords-all [data]
  (->> data
       (map (fn [v] (assoc '{} :name (name (first v)) :data (last v))))
       (map (fn [v] (update v :data (fn [c] (map #(assoc '{} (:year %) (:precent_all %)) c)))))
       (map (fn [v] (update v :data #(into {} %))))))


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
           (GET "/linechart-keywords-all/:ks" [ks :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (line-chart-data-keywords-all (keywords (split-params ks))))})
           (GET "/linechart-keywords/:ks" [ks :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (line-chart-data-keywords (keywords (split-params ks))))})
           (GET "/" []
             (resp/content-type (resp/resource-response "index.html" {:root "public"}) "text/html"))
           (route/resources "/")
           (route/not-found "<h1>Page not found</h1>"))










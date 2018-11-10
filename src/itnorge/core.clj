(ns itnorge.core
  (:require [compojure.core :refer :all]
            [clojure.data.json :as json]
            [clojure.string :as cstr]
            [compojure.route :as route]
            [clojure.java.io :as io]
            [ring.middleware.defaults :refer [wrap-defaults site-defaults]]))

;;clojure.walk/keywordize-keys
(defn keywordize-keys [m]
  (let [f (fn [[k v]] (if (string? k) [(keyword k) v] [k v]))]
    (clojure.walk/postwalk (fn [x] (if (map? x) (into {} (map f x)) x)) m)))

(defn rj [f]
  (keywordize-keys (json/read-str (slurp (io/input-stream (io/resource (str "db/" f)))))))


(def KEYWORDS (rj "keywords"))
(def BUSINESSES (rj "businesses"))

(defn keywords [ks]
  (if (empty? ks) KEYWORDS
                  (select-keys KEYWORDS (map keyword ks))))

(defn businesses [orgnumbers]
  (if (empty? orgnumbers) BUSINESSES
                          (filter (fn [v] (some #(= (:business_orgnr v) %) orgnumbers)) BUSINESSES)))

(defn split-params [s]
  (cstr/split s #"!"))


(defroutes app-routes
           (GET "/businesses/:orgnumbers" [orgnumbers :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (businesses (split-params orgnumbers)))})
           (GET "/keywords/:ks" [ks :as req]
             {:status  200
              :headers {"Content-Type" "application/json" "Access-Control-Allow-Origin" "*"}
              :body    (json/write-str (keywords (split-params ks)))})
           (route/not-found (io/resource "public/index.html"))
           (route/resources "/"))

(def app
  (wrap-defaults app-routes site-defaults))









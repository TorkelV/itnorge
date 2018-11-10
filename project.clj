(defproject itnorge "0.1.0-SNAPSHOT"
  :description "FIXME: write description"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.8.0"]
                 [compojure "1.6.1"]
                 [ring "1.4.0-RC2"]
                 [org.clojure/data.json "0.2.6"]]
  :plugins [[lein-ring "0.12.4" :exclusions [org.clojure/clojure]]]
  :ring {:handler itnorge.core/app})

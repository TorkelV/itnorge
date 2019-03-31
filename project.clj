(defproject itnorge "0.1.0-SNAPSHOT"
  :description "FIXME: write descption"
  :url "http://example.com/FIXME"
  :license {:name "Eclipse Public License"
            :url  "http://www.eclipse.org/legal/epl-v10.html"}
  :dependencies [[org.clojure/clojure "1.10.0"]
                 [compojure "1.6.1"]
                 [ring/ring-core "1.6.3"]
                 [org.clojure/data.json "0.2.6"]
                 [ring/ring-defaults "0.3.2"]
                 [ring/ring-jetty-adapter "1.6.3"]]
  :main  itnorge.core/main)


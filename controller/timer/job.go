package timer

import (
	"encoding/json"
	"fmt"
	"log"
	"strings"
)

const Bucket = "jobs"

type Job struct {
	ID        string `json:"id"`
	Minute    string `json:"minute"`
	Day       string `json:"day"`
	Hour      string `json:"hour"`
	Second    string `json:"second"`
	Equipment string `json:"equipment"`
	On        bool   `json:"on"`
	Value     int    `json:"value"`
	Name      string `json:"name"`
}

func (c *Controller) Get(id string) (Job, error) {
	var job Job
	return job, c.store.Get(Bucket, id, &job)
}

func (c *Controller) List() (*[]interface{}, error) {
	fn := func(v []byte) (interface{}, error) {
		var job Job
		return &job, json.Unmarshal(v, &job)
	}
	return c.store.List(Bucket, fn)
}

func (c *Controller) Create(job Job) error {
	fn := func(id string) interface{} {
		job.ID = id
		return job
	}
	if err := c.store.Create(Bucket, fn); err != nil {
		return err
	}
	return c.addToCron(job)
}

func (c *Controller) Update(id string, payload Job) error {
	return c.store.Update(Bucket, id, payload)
}

func (c *Controller) Delete(id string) error {
	if err := c.store.Delete(Bucket, id); err != nil {
		return err
	}
	return c.deleteFromCron(id)
}

func (c *Controller) loadAllJobs() error {
	jobs, err := c.List()
	if err != nil {
		return err
	}
	if jobs == nil {
		log.Printf("No jobs present")
		return nil
	}
	for _, rawJob := range *jobs {
		job, ok := rawJob.(*Job)
		if !ok {
			log.Println("ERROR: Failed to typecast to job")
			continue
		}
		if err := c.addToCron(*job); err != nil {
			log.Println("ERROR: Failed to add job in cron runner. Error:", err)
		}
	}
	return nil
}

func (c *Controller) addToCron(job Job) error {
	cronSpec := strings.Join([]string{job.Second, job.Minute, job.Hour, job.Day, "*", "?"}, " ")
	runner, err := c.Runner(job)
	if err != nil {
		return err
	}
	cronID, err := c.runner.AddJob(cronSpec, runner)
	if err != nil {
		return err
	}
	log.Println("Successfully added cron entry. ID:", cronID)
	c.cronIDs[job.ID] = cronID
	return nil
}

func (c *Controller) deleteFromCron(jobID string) error {
	id, ok := c.cronIDs[jobID]
	if !ok {
		return fmt.Errorf("Cron ID not found for job ID:%s", jobID)
	}
	c.runner.Remove(id)
	return nil
}
